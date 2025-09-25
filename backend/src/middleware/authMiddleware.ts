import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, UserRole } from '../models/User';
import { UserProfile } from '../models/UserProfile';
import { redisClient } from '../config/redis';

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: UserRole;
    status: string;
  };
}

interface TokenPayload {
  userId: number;
  email: string;
  role: UserRole;
  status: string;
}

// Authentication middleware
export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Access token required' });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
    
    // Check if user still exists and is active
    const user = await User.findByPk(decoded.userId);
    if (!user || user.status !== 'Active') {
      res.status(401).json({ error: 'User not found or inactive' });
      return;
    }

    // Add user info to request
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      status: decoded.status,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }
    
    res.status(500).json({ error: 'Authentication error' });
  }
};

// Role-based authorization middleware
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ 
        error: 'Insufficient permissions',
        required: allowedRoles,
        current: req.user.role
      });
      return;
    }

    next();
  };
};

// Optional authentication middleware (for public endpoints that can benefit from user context)
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
      
      const user = await User.findByPk(decoded.userId);
      if (user && user.status === 'Active') {
        req.user = {
          id: decoded.userId,
          email: decoded.email,
          role: decoded.role,
          status: decoded.status,
        };
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication for optional auth
    next();
  }
};

// Role hierarchy for permission checking
const roleHierarchy: Record<UserRole, number> = {
  'Director': 8,
  'Project Manager': 7,
  'Quantity Surveyor': 6,
  'Sales Manager': 5,
  'Customer Success Manager': 4,
  'Employee': 3,
  'Customer': 2,
  'Supplier': 1,
};

// Check if user has minimum role level
export const requireMinimumRole = (minimumRole: UserRole) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const userLevel = roleHierarchy[req.user.role];
    const requiredLevel = roleHierarchy[minimumRole];

    if (userLevel < requiredLevel) {
      res.status(403).json({ 
        error: 'Insufficient role level',
        required: minimumRole,
        current: req.user.role
      });
      return;
    }

    next();
  };
};

// Check if user can access resource (own resources or higher role)
export const canAccessResource = (resourceUserId?: number) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Directors and Project Managers can access all resources
    if (['Director', 'Project Manager'].includes(req.user.role)) {
      next();
      return;
    }

    // Users can access their own resources
    if (resourceUserId && req.user.id === resourceUserId) {
      next();
      return;
    }

    // Check if resource user ID is provided in request params
    const paramUserId = req.params.userId ? parseInt(req.params.userId) : null;
    if (paramUserId && req.user.id === paramUserId) {
      next();
      return;
    }

    res.status(403).json({ error: 'Cannot access this resource' });
  };
};

// Rate limiting middleware (basic implementation)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export const rateLimit = (maxRequests: number, windowMs: number) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const key = req.ip || 'unknown';
    const now = Date.now();
    
    const record = rateLimitStore.get(key);
    
    if (!record || now > record.resetTime) {
      rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
      next();
      return;
    }
    
    if (record.count >= maxRequests) {
      res.status(429).json({ 
        error: 'Too many requests',
        retryAfter: Math.ceil((record.resetTime - now) / 1000)
      });
      return;
    }
    
    record.count++;
    next();
  };
};

// Clean up rate limit store periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean up every minute

export type { AuthenticatedRequest };