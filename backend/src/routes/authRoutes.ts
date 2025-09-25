import { Router, Request, Response } from 'express';
import Joi from 'joi';
import { authService } from '../services/authService';
import { authenticate, rateLimit, AuthenticatedRequest } from '../middleware/authMiddleware';
import { UserRole } from '../models/User';
import { logger } from '../utils/logger';

const router = Router();

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]')).required().messages({
    'string.min': 'Password must be at least 8 characters long',
    'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    'any.required': 'Password is required'
  }),
  role: Joi.string().valid('Director', 'Project Manager', 'Quantity Surveyor', 'Sales Manager', 'Customer Success Manager', 'Employee', 'Customer', 'Supplier').required(),
  firstName: Joi.string().min(2).max(50).required().messages({
    'string.min': 'First name must be at least 2 characters long',
    'string.max': 'First name cannot exceed 50 characters',
    'any.required': 'First name is required'
  }),
  lastName: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Last name must be at least 2 characters long',
    'string.max': 'Last name cannot exceed 50 characters',
    'any.required': 'Last name is required'
  }),
  phone: Joi.string().pattern(/^[\+]?[1-9][\d]{0,15}$/).optional().messages({
    'string.pattern.base': 'Please provide a valid phone number'
  }),
  companyName: Joi.string().max(255).optional(),
  position: Joi.string().max(100).optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required'
  }),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().required().messages({
    'any.required': 'Reset token is required'
  }),
  password: Joi.string().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]')).required().messages({
    'string.min': 'Password must be at least 8 characters long',
    'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    'any.required': 'Password is required'
  }),
});

const verifyEmailSchema = Joi.object({
  token: Joi.string().required().messages({
    'any.required': 'Verification token is required'
  }),
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    'any.required': 'Current password is required'
  }),
  newPassword: Joi.string().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]')).required().messages({
    'string.min': 'New password must be at least 8 characters long',
    'string.pattern.base': 'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    'any.required': 'New password is required'
  }),
});

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    'any.required': 'Refresh token is required'
  }),
});

// Apply rate limiting to auth endpoints
const authRateLimit = rateLimit(5, 15 * 60 * 1000); // 5 requests per 15 minutes
const loginRateLimit = rateLimit(3, 15 * 60 * 1000); // 3 login attempts per 15 minutes

// Register endpoint
router.post('/register', authRateLimit, async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        error: 'Validation Error',
        message: error.details[0].message,
        details: error.details
      });
      return;
    }

    const result = await authService.register(value);
    
    logger.info(`User registered: ${value.email} with role: ${value.role}`);
    
    res.status(201).json({
      message: 'Registration successful. Please check your email to verify your account.',
      user: {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
        status: result.user.status,
        emailVerified: result.user.emailVerified,
      }
    });
  } catch (error: any) {
    logger.error('Registration error:', error);
    
    if (error.message.includes('already exists')) {
      res.status(409).json({ error: 'User with this email already exists' });
      return;
    }
    
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// Login endpoint
router.post('/login', loginRateLimit, async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        error: 'Validation Error',
        message: error.details[0].message
      });
      return;
    }

    const result = await authService.login(value);
    
    logger.info(`User logged in: ${value.email}`);
    
    res.json({
      message: 'Login successful',
      ...result
    });
  } catch (error: any) {
    logger.error('Login error:', error);
    
    // Don't reveal specific error details for security
    res.status(401).json({ error: 'Invalid credentials or account not verified' });
  }
});

// Logout endpoint
router.post('/logout', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    
    if (refreshToken) {
      await authService.logout(refreshToken);
    }
    
    logger.info(`User logged out: ${req.user?.email}`);
    
    res.json({ message: 'Logout successful' });
  } catch (error: any) {
    logger.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Refresh token endpoint
router.post('/refresh', async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body
    const { error, value } = refreshTokenSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        error: 'Validation Error',
        message: error.details[0].message
      });
      return;
    }

    const result = await authService.refreshToken(value.refreshToken);
    
    res.json({
      message: 'Token refreshed successfully',
      ...result
    });
  } catch (error: any) {
    logger.error('Token refresh error:', error);
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// Forgot password endpoint
router.post('/forgot-password', authRateLimit, async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body
    const { error, value } = forgotPasswordSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        error: 'Validation Error',
        message: error.details[0].message
      });
      return;
    }

    await authService.forgotPassword(value.email);
    
    logger.info(`Password reset requested for: ${value.email}`);
    
    // Always return success to prevent email enumeration
    res.json({ 
      message: 'If an account with that email exists, a password reset link has been sent.' 
    });
  } catch (error: any) {
    logger.error('Forgot password error:', error);
    res.json({ 
      message: 'If an account with that email exists, a password reset link has been sent.' 
    });
  }
});

// Reset password endpoint
router.post('/reset-password', authRateLimit, async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body
    const { error, value } = resetPasswordSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        error: 'Validation Error',
        message: error.details[0].message
      });
      return;
    }

    await authService.resetPassword(value.token, value.password);
    
    logger.info('Password reset completed');
    
    res.json({ message: 'Password reset successful. You can now login with your new password.' });
  } catch (error: any) {
    logger.error('Reset password error:', error);
    
    if (error.message.includes('Invalid or expired')) {
      res.status(400).json({ error: 'Invalid or expired reset token' });
      return;
    }
    
    res.status(500).json({ error: 'Password reset failed. Please try again.' });
  }
});

// Verify email endpoint
router.post('/verify-email', async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body
    const { error, value } = verifyEmailSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        error: 'Validation Error',
        message: error.details[0].message
      });
      return;
    }

    await authService.verifyEmail(value.token);
    
    logger.info('Email verification completed');
    
    res.json({ message: 'Email verified successfully. Your account is now active.' });
  } catch (error: any) {
    logger.error('Email verification error:', error);
    
    if (error.message.includes('Invalid or expired')) {
      res.status(400).json({ error: 'Invalid or expired verification token' });
      return;
    }
    
    res.status(500).json({ error: 'Email verification failed. Please try again.' });
  }
});

// Change password endpoint (authenticated)
router.post('/change-password', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Validate request body
    const { error, value } = changePasswordSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        error: 'Validation Error',
        message: error.details[0].message
      });
      return;
    }

    await authService.changePassword(req.user!.id, value.currentPassword, value.newPassword);
    
    logger.info(`Password changed for user: ${req.user?.email}`);
    
    res.json({ message: 'Password changed successfully. Please login again with your new password.' });
  } catch (error: any) {
    logger.error('Change password error:', error);
    
    if (error.message.includes('Current password is incorrect')) {
      res.status(400).json({ error: 'Current password is incorrect' });
      return;
    }
    
    res.status(500).json({ error: 'Password change failed. Please try again.' });
  }
});

// Get current user profile (authenticated)
router.get('/me', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = await authService.getCurrentUser(req.user!.id);
    
    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        emailVerified: user.emailVerified,
        profile: (user as any).profile,
      }
    });
  } catch (error: any) {
    logger.error('Get current user error:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Validate token endpoint (for frontend token validation)
router.post('/validate-token', async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ valid: false, error: 'No token provided' });
      return;
    }

    const token = authHeader.substring(7);
    const decoded = await authService.validateToken(token);
    
    res.json({ 
      valid: true, 
      user: {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        status: decoded.status,
      }
    });
  } catch (error: any) {
    res.status(401).json({ valid: false, error: 'Invalid token' });
  }
});

export { router as authRoutes };