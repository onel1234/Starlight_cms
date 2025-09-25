import { Router, Request, Response } from 'express';
import Joi from 'joi';
import { Op } from 'sequelize';
import { User, UserRole } from '../models/User';
import { UserProfile } from '../models/UserProfile';
import { authenticate, authorize, requireMinimumRole, canAccessResource, AuthenticatedRequest } from '../middleware/authMiddleware';
import { logger } from '../utils/logger';

const router = Router();

// Validation schemas
const createUserSchema = Joi.object({
  email: Joi.string().email().required(),
  role: Joi.string().valid('Director', 'Project Manager', 'Quantity Surveyor', 'Sales Manager', 'Customer Success Manager', 'Employee', 'Customer', 'Supplier').required(),
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  phone: Joi.string().pattern(/^[\+]?[1-9][\d]{0,15}$/).optional(),
  companyName: Joi.string().max(255).optional(),
  position: Joi.string().max(100).optional(),
  address: Joi.string().max(500).optional(),
});

const updateUserSchema = Joi.object({
  email: Joi.string().email().optional(),
  role: Joi.string().valid('Director', 'Project Manager', 'Quantity Surveyor', 'Sales Manager', 'Customer Success Manager', 'Employee', 'Customer', 'Supplier').optional(),
  status: Joi.string().valid('Active', 'Inactive', 'Pending').optional(),
  firstName: Joi.string().min(2).max(50).optional(),
  lastName: Joi.string().min(2).max(50).optional(),
  phone: Joi.string().pattern(/^[\+]?[1-9][\d]{0,15}$/).allow('').optional(),
  companyName: Joi.string().max(255).allow('').optional(),
  position: Joi.string().max(100).allow('').optional(),
  address: Joi.string().max(500).allow('').optional(),
});

const updateProfileSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).optional(),
  lastName: Joi.string().min(2).max(50).optional(),
  phone: Joi.string().pattern(/^[\+]?[1-9][\d]{0,15}$/).allow('').optional(),
  companyName: Joi.string().max(255).allow('').optional(),
  position: Joi.string().max(100).allow('').optional(),
  address: Joi.string().max(500).allow('').optional(),
});

// Get all users (with pagination and filtering)
router.get('/', authenticate, requireMinimumRole('Project Manager'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    
    const role = req.query.role as UserRole;
    const status = req.query.status as string;
    const search = req.query.search as string;

    // Build where clause
    const whereClause: any = {};
    
    if (role) {
      whereClause.role = role;
    }
    
    if (status) {
      whereClause.status = status;
    }
    
    if (search) {
      whereClause[Op.or] = [
        { email: { [Op.like]: `%${search}%` } },
        { '$profile.firstName$': { [Op.like]: `%${search}%` } },
        { '$profile.lastName$': { [Op.like]: `%${search}%` } },
        { '$profile.companyName$': { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      include: [{ 
        model: UserProfile, 
        as: 'profile',
        required: false 
      }],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      distinct: true,
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      users: users.map(user => ({
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        profile: (user as any).profile,
      })),
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers: count,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      }
    });
  } catch (error: any) {
    logger.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user by ID
router.get('/:id', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      res.status(400).json({ error: 'Invalid user ID' });
      return;
    }

    // Check if user can access this resource
    if (req.user!.role !== 'Director' && req.user!.role !== 'Project Manager' && req.user!.id !== userId) {
      res.status(403).json({ error: 'Cannot access this user profile' });
      return;
    }

    const user = await User.findByPk(userId, {
      include: [{ model: UserProfile, as: 'profile' }],
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        profile: (user as any).profile,
      }
    });
  } catch (error: any) {
    logger.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Create new user (admin only)
router.post('/', authenticate, authorize('Director'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Validate request body
    const { error, value } = createUserSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        error: 'Validation Error',
        message: error.details[0].message,
        details: error.details
      });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email: value.email } });
    if (existingUser) {
      res.status(409).json({ error: 'User with this email already exists' });
      return;
    }

    // Create user with temporary password (they'll need to reset it)
    const tempPassword = Math.random().toString(36).slice(-12) + 'A1!';
    const bcrypt = require('bcryptjs');
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    const user = await User.create({
      email: value.email,
      passwordHash,
      role: value.role,
      status: 'Active', // Admin-created users are active by default
      emailVerified: true, // Admin-created users are verified by default
    });

    // Create user profile
    await UserProfile.create({
      userId: user.id,
      firstName: value.firstName,
      lastName: value.lastName,
      phone: value.phone,
      companyName: value.companyName,
      position: value.position,
      address: value.address,
    });

    // Fetch user with profile
    const createdUser = await User.findByPk(user.id, {
      include: [{ model: UserProfile, as: 'profile' }],
    });

    logger.info(`User created by admin: ${value.email} with role: ${value.role}`);

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: createdUser!.id,
        email: createdUser!.email,
        role: createdUser!.role,
        status: createdUser!.status,
        emailVerified: createdUser!.emailVerified,
        createdAt: createdUser!.createdAt,
        profile: (createdUser as any).profile,
      },
      tempPassword // Return temp password for admin to share with user
    });
  } catch (error: any) {
    logger.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user (admin or self)
router.put('/:id', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      res.status(400).json({ error: 'Invalid user ID' });
      return;
    }

    // Check permissions
    const canUpdate = req.user!.role === 'Director' || 
                     (req.user!.role === 'Project Manager' && req.user!.id !== userId) ||
                     req.user!.id === userId;
    
    if (!canUpdate) {
      res.status(403).json({ error: 'Cannot update this user' });
      return;
    }

    // Validate request body
    const { error, value } = updateUserSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        error: 'Validation Error',
        message: error.details[0].message
      });
      return;
    }

    const user = await User.findByPk(userId, {
      include: [{ model: UserProfile, as: 'profile' }],
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Separate user and profile fields
    const userFields: any = {};
    const profileFields: any = {};

    if (value.email !== undefined) userFields.email = value.email;
    if (value.role !== undefined && req.user!.role === 'Director') userFields.role = value.role;
    if (value.status !== undefined && req.user!.role === 'Director') userFields.status = value.status;

    if (value.firstName !== undefined) profileFields.firstName = value.firstName;
    if (value.lastName !== undefined) profileFields.lastName = value.lastName;
    if (value.phone !== undefined) profileFields.phone = value.phone || null;
    if (value.companyName !== undefined) profileFields.companyName = value.companyName || null;
    if (value.position !== undefined) profileFields.position = value.position || null;
    if (value.address !== undefined) profileFields.address = value.address || null;

    // Update user fields
    if (Object.keys(userFields).length > 0) {
      await User.update(userFields, { where: { id: userId } });
    }

    // Update profile fields
    if (Object.keys(profileFields).length > 0) {
      const profile = await UserProfile.findOne({ where: { userId } });
      if (profile) {
        await UserProfile.update(profileFields, { where: { userId } });
      } else {
        await UserProfile.create({ userId, ...profileFields });
      }
    }

    // Fetch updated user
    const updatedUser = await User.findByPk(userId, {
      include: [{ model: UserProfile, as: 'profile' }],
    });

    logger.info(`User updated: ${updatedUser!.email} by ${req.user!.email}`);

    res.json({
      message: 'User updated successfully',
      user: {
        id: updatedUser!.id,
        email: updatedUser!.email,
        role: updatedUser!.role,
        status: updatedUser!.status,
        emailVerified: updatedUser!.emailVerified,
        createdAt: updatedUser!.createdAt,
        updatedAt: updatedUser!.updatedAt,
        profile: (updatedUser as any).profile,
      }
    });
  } catch (error: any) {
    logger.error('Update user error:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      res.status(409).json({ error: 'Email already exists' });
      return;
    }
    
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Update own profile (authenticated users)
router.put('/profile/me', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Validate request body
    const { error, value } = updateProfileSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        error: 'Validation Error',
        message: error.details[0].message
      });
      return;
    }

    const userId = req.user!.id;

    // Update profile
    const profile = await UserProfile.findOne({ where: { userId } });
    if (profile) {
      await UserProfile.update(value, { where: { userId } });
    } else {
      await UserProfile.create({ userId, ...value });
    }

    // Fetch updated user with profile
    const updatedUser = await User.findByPk(userId, {
      include: [{ model: UserProfile, as: 'profile' }],
    });

    logger.info(`Profile updated by user: ${req.user!.email}`);

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser!.id,
        email: updatedUser!.email,
        role: updatedUser!.role,
        status: updatedUser!.status,
        emailVerified: updatedUser!.emailVerified,
        profile: (updatedUser as any).profile,
      }
    });
  } catch (error: any) {
    logger.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Deactivate user (soft delete - admin only)
router.delete('/:id', authenticate, authorize('Director'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      res.status(400).json({ error: 'Invalid user ID' });
      return;
    }

    // Prevent self-deletion
    if (req.user!.id === userId) {
      res.status(400).json({ error: 'Cannot deactivate your own account' });
      return;
    }

    const user = await User.findByPk(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Soft delete by setting status to Inactive
    await User.update(
      { status: 'Inactive' },
      { where: { id: userId } }
    );

    logger.info(`User deactivated: ${user.email} by ${req.user!.email}`);

    res.json({ message: 'User deactivated successfully' });
  } catch (error: any) {
    logger.error('Deactivate user error:', error);
    res.status(500).json({ error: 'Failed to deactivate user' });
  }
});

// Reactivate user (admin only)
router.post('/:id/reactivate', authenticate, authorize('Director'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      res.status(400).json({ error: 'Invalid user ID' });
      return;
    }

    const user = await User.findByPk(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    await User.update(
      { status: 'Active' },
      { where: { id: userId } }
    );

    logger.info(`User reactivated: ${user.email} by ${req.user!.email}`);

    res.json({ message: 'User reactivated successfully' });
  } catch (error: any) {
    logger.error('Reactivate user error:', error);
    res.status(500).json({ error: 'Failed to reactivate user' });
  }
});

// Get user statistics (admin only)
router.get('/stats/overview', authenticate, authorize('Director'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const totalUsers = await User.count();
    const activeUsers = await User.count({ where: { status: 'Active' } });
    const pendingUsers = await User.count({ where: { status: 'Pending' } });
    const inactiveUsers = await User.count({ where: { status: 'Inactive' } });

    const usersByRole = await User.findAll({
      attributes: ['role', [User.sequelize!.fn('COUNT', User.sequelize!.col('id')), 'count']],
      group: ['role'],
      raw: true,
    });

    res.json({
      totalUsers,
      activeUsers,
      pendingUsers,
      inactiveUsers,
      usersByRole: usersByRole.reduce((acc: any, item: any) => {
        acc[item.role] = parseInt(item.count);
        return acc;
      }, {}),
    });
  } catch (error: any) {
    logger.error('Get user stats error:', error);
    res.status(500).json({ error: 'Failed to fetch user statistics' });
  }
});

export { router as userRoutes };