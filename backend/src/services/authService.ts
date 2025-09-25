import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import type { StringValue } from 'ms';
import crypto from 'crypto';
import { User, UserRole } from '../models/User';
import { UserProfile } from '../models/UserProfile';
import { emailService } from './emailService';
import { redisClient } from '../config/redis';

interface LoginCredentials {
    email: string;
    password: string;
}

interface RegisterData {
    email: string;
    password: string;
    role: UserRole;
    firstName: string;
    lastName: string;
    phone?: string;
    companyName?: string;
    position?: string;
}

interface TokenPayload {
    userId: number;
    email: string;
    role: UserRole;
    status: string;
}

interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    user: {
        id: number;
        email: string;
        role: UserRole;
        status: string;
        emailVerified: boolean;
        profile?: any;
    };
}

class AuthService {
    private readonly JWT_SECRET: string;
    private readonly JWT_REFRESH_SECRET: string;
    private readonly JWT_EXPIRES_IN: StringValue | number = (process.env.JWT_EXPIRES_IN || '24h') as StringValue;
    private readonly JWT_REFRESH_EXPIRES_IN: StringValue | number = (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as StringValue;
    private readonly BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12');

    constructor() {
        this.JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-for-development';
        this.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret-key-for-development';

        if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
            console.warn('Warning: Using fallback JWT secrets. Set JWT_SECRET and JWT_REFRESH_SECRET in production!');
        }
    }

    async register(data: RegisterData): Promise<{ user: User; verificationToken: string }> {
        // Check if user already exists
        const existingUser = await User.findOne({ where: { email: data.email } });
        if (existingUser) {
            throw new Error('User with this email already exists');
        }

        // Hash password
        const passwordHash = await bcrypt.hash(data.password, this.BCRYPT_ROUNDS);

        // Create user
        const user = await User.create({
            email: data.email,
            passwordHash,
            role: data.role,
            status: 'Pending',
            emailVerified: false,
        });

        // Create user profile
        await UserProfile.create({
            userId: user.id,
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            companyName: data.companyName,
            position: data.position,
        });

        // Generate email verification token
        const verificationToken = this.generateVerificationToken();
        await this.storeVerificationToken(user.id, verificationToken);

        // Send verification email
        await emailService.sendVerificationEmail(user.email, verificationToken, data.firstName);

        return { user, verificationToken };
    }

    async login(credentials: LoginCredentials): Promise<AuthTokens> {
        const { email, password } = credentials;

        // Find user with profile
        const user = await User.findOne({
            where: { email },
            include: [{ model: UserProfile, as: 'profile' }],
        });

        if (!user) {
            throw new Error('Invalid credentials');
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.passwordHash);
        if (!isValidPassword) {
            throw new Error('Invalid credentials');
        }

        // Check if user is active
        if (user.status !== 'Active') {
            throw new Error('Account is not active. Please contact administrator.');
        }

        // Check if email is verified
        if (!user.emailVerified) {
            throw new Error('Please verify your email before logging in');
        }

        // Generate tokens
        const tokens = await this.generateTokens(user);

        return tokens;
    }

    async refreshToken(refreshToken: string): Promise<AuthTokens> {
        try {
            // Verify refresh token
            const decoded = jwt.verify(refreshToken, this.JWT_REFRESH_SECRET) as TokenPayload;

            // Check if refresh token is blacklisted
            const isBlacklisted = await redisClient.get(`blacklist:${refreshToken}`);
            if (isBlacklisted) {
                throw new Error('Token is invalid');
            }

            // Find user
            const user = await User.findByPk(decoded.userId, {
                include: [{ model: UserProfile, as: 'profile' }],
            });

            if (!user || user.status !== 'Active') {
                throw new Error('User not found or inactive');
            }

            // Generate new tokens
            const tokens = await this.generateTokens(user);

            // Blacklist old refresh token
            await redisClient.setEx(`blacklist:${refreshToken}`, 7 * 24 * 60 * 60, 'true');

            return tokens;
        } catch (error) {
            throw new Error('Invalid refresh token');
        }
    }

    async logout(refreshToken: string): Promise<void> {
        // Blacklist refresh token
        await redisClient.setEx(`blacklist:${refreshToken}`, 7 * 24 * 60 * 60, 'true');
    }

    async forgotPassword(email: string): Promise<void> {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            // Don't reveal if email exists or not
            return;
        }

        // Generate reset token
        const resetToken = this.generateResetToken();
        await this.storeResetToken(user.id, resetToken);

        // Send reset email
        const userProfile = await UserProfile.findOne({ where: { userId: user.id } });
        await emailService.sendPasswordResetEmail(
            user.email,
            resetToken,
            userProfile?.firstName || 'User'
        );
    }

    async resetPassword(token: string, newPassword: string): Promise<void> {
        // Verify reset token
        const userId = await this.verifyResetToken(token);
        if (!userId) {
            throw new Error('Invalid or expired reset token');
        }

        // Hash new password
        const passwordHash = await bcrypt.hash(newPassword, this.BCRYPT_ROUNDS);

        // Update user password
        await User.update(
            { passwordHash },
            { where: { id: userId } }
        );

        // Remove reset token
        await redisClient.del(`reset:${userId}`);

        // Blacklist all existing refresh tokens for this user
        await this.blacklistUserTokens(userId);
    }

    async verifyEmail(token: string): Promise<void> {
        // Verify email verification token
        const userId = await this.verifyEmailToken(token);
        if (!userId) {
            throw new Error('Invalid or expired verification token');
        }

        // Update user email verification status
        await User.update(
            { emailVerified: true, status: 'Active' },
            { where: { id: userId } }
        );

        // Remove verification token
        await redisClient.del(`verify:${userId}`);
    }

    async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<void> {
        const user = await User.findByPk(userId);
        if (!user) {
            throw new Error('User not found');
        }

        // Verify current password
        const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isValidPassword) {
            throw new Error('Current password is incorrect');
        }

        // Hash new password
        const passwordHash = await bcrypt.hash(newPassword, this.BCRYPT_ROUNDS);

        // Update password
        await User.update(
            { passwordHash },
            { where: { id: userId } }
        );

        // Blacklist all existing refresh tokens for this user
        await this.blacklistUserTokens(userId);
    }

    private async generateTokens(user: User): Promise<AuthTokens> {
        const payload: TokenPayload = {
            userId: user.id,
            email: user.email,
            role: user.role,
            status: user.status,
        };

        const signOptions: SignOptions = { expiresIn: this.JWT_EXPIRES_IN };
        const refreshSignOptions: SignOptions = { expiresIn: this.JWT_REFRESH_EXPIRES_IN };

        const accessToken = jwt.sign(payload, this.JWT_SECRET, signOptions);
        const refreshToken = jwt.sign(payload, this.JWT_REFRESH_SECRET, refreshSignOptions);

        // Store refresh token in Redis
        await redisClient.setEx(`refresh:${user.id}`, 7 * 24 * 60 * 60, refreshToken);

        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                status: user.status,
                emailVerified: user.emailVerified,
                profile: (user as any).profile,
            },
        };
    }

    private generateVerificationToken(): string {
        return crypto.randomBytes(32).toString('hex');
    }

    private generateResetToken(): string {
        return crypto.randomBytes(32).toString('hex');
    }

    private async storeVerificationToken(userId: number, token: string): Promise<void> {
        // Store for 24 hours
        await redisClient.setEx(`verify:${userId}`, 24 * 60 * 60, token);
    }

    private async storeResetToken(userId: number, token: string): Promise<void> {
        // Store for 1 hour
        await redisClient.setEx(`reset:${userId}`, 60 * 60, token);
    }

    private async verifyEmailToken(token: string): Promise<number | null> {
        const keys = await redisClient.keys('verify:*');
        for (const key of keys) {
            const storedToken = await redisClient.get(key);
            if (storedToken === token) {
                const userId = parseInt(key.split(':')[1]);
                return userId;
            }
        }
        return null;
    }

    private async verifyResetToken(token: string): Promise<number | null> {
        const keys = await redisClient.keys('reset:*');
        for (const key of keys) {
            const storedToken = await redisClient.get(key);
            if (storedToken === token) {
                const userId = parseInt(key.split(':')[1]);
                return userId;
            }
        }
        return null;
    }

    private async blacklistUserTokens(userId: number): Promise<void> {
        // Remove stored refresh token
        await redisClient.del(`refresh:${userId}`);
    }

    async validateToken(token: string): Promise<TokenPayload> {
        try {
            const decoded = jwt.verify(token, this.JWT_SECRET) as TokenPayload;
            return decoded;
        } catch (error) {
            throw new Error('Invalid token');
        }
    }

    async getCurrentUser(userId: number): Promise<User> {
        const user = await User.findByPk(userId, {
            include: [{ model: UserProfile, as: 'profile' }],
        });

        if (!user) {
            throw new Error('User not found');
        }

        return user;
    }
}

export const authService = new AuthService();