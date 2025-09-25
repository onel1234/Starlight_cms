import { Response, NextFunction } from 'express';
import Joi from 'joi';
import { projectService } from '../services/projectService';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { ValidationError } from '../middleware/errorHandler';

// Validation schemas
const createProjectSchema = Joi.object({
  name: Joi.string().min(1).max(255).required(),
  description: Joi.string().max(1000).optional(),
  clientId: Joi.number().integer().positive().optional(),
  projectManagerId: Joi.number().integer().positive().optional(),
  startDate: Joi.date().required(),
  endDate: Joi.date().greater(Joi.ref('startDate')).required(),
  budget: Joi.number().positive().required(),
  location: Joi.string().max(500).optional(),
  projectType: Joi.string().max(100).optional()
});

const updateProjectSchema = Joi.object({
  name: Joi.string().min(1).max(255).optional(),
  description: Joi.string().max(1000).optional(),
  clientId: Joi.number().integer().positive().optional(),
  projectManagerId: Joi.number().integer().positive().optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  budget: Joi.number().positive().optional(),
  actualCost: Joi.number().min(0).optional(),
  status: Joi.string().valid('Planning', 'In Progress', 'On Hold', 'Completed', 'Closed').optional(),
  location: Joi.string().max(500).optional(),
  projectType: Joi.string().max(100).optional()
}).min(1);

const querySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sortBy: Joi.string().valid('id', 'name', 'startDate', 'endDate', 'budget', 'status', 'createdAt').default('createdAt'),
  sortOrder: Joi.string().valid('ASC', 'DESC').default('DESC'),
  status: Joi.alternatives().try(
    Joi.string().valid('Planning', 'In Progress', 'On Hold', 'Completed', 'Closed'),
    Joi.array().items(Joi.string().valid('Planning', 'In Progress', 'On Hold', 'Completed', 'Closed'))
  ).optional(),
  clientId: Joi.number().integer().positive().optional(),
  projectManagerId: Joi.number().integer().positive().optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  search: Joi.string().max(255).optional()
});

const approvalDecisionSchema = Joi.object({
  decision: Joi.string().valid('Approved', 'Rejected').required(),
  comments: Joi.string().max(1000).optional()
});

const budgetUpdateSchema = Joi.object({
  actualCost: Joi.number().min(0).required()
});

class ProjectController {
  async createProject(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate request body
      const { error, value } = createProjectSchema.validate(req.body);
      if (error) {
        throw new ValidationError('Validation failed', error.details);
      }

      // Add creator ID
      const projectData = {
        ...value,
        createdBy: req.user!.id
      };

      const project = await projectService.createProject(projectData);

      res.status(201).json({
        success: true,
        message: 'Project created successfully',
        data: project
      });
    } catch (error) {
      next(error);
    }
  }

  async getProjects(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate query parameters
      const { error, value } = querySchema.validate(req.query);
      if (error) {
        throw new ValidationError('Invalid query parameters', error.details);
      }

      const {
        page,
        limit,
        sortBy,
        sortOrder,
        status,
        clientId,
        projectManagerId,
        startDate,
        endDate,
        search
      } = value;

      const filters = {
        ...(status && { status }),
        ...(clientId && { clientId }),
        ...(projectManagerId && { projectManagerId }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        ...(search && { search })
      };

      const pagination = {
        page,
        limit,
        sortBy,
        sortOrder
      };

      const result = await projectService.getProjects(
        filters,
        pagination,
        req.user!.role,
        req.user!.id
      );

      res.json({
        success: true,
        message: 'Projects retrieved successfully',
        data: result.projects,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  async getProjectById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const projectId = parseInt(req.params.id);
      
      if (isNaN(projectId)) {
        throw new ValidationError('Invalid project ID');
      }

      const project = await projectService.getProjectById(
        projectId,
        req.user!.role,
        req.user!.id
      );

      res.json({
        success: true,
        message: 'Project retrieved successfully',
        data: project
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProject(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const projectId = parseInt(req.params.id);
      
      if (isNaN(projectId)) {
        throw new ValidationError('Invalid project ID');
      }

      // Validate request body
      const { error, value } = updateProjectSchema.validate(req.body);
      if (error) {
        throw new ValidationError('Validation failed', error.details);
      }

      const project = await projectService.updateProject(
        projectId,
        value,
        req.user!.role,
        req.user!.id
      );

      res.json({
        success: true,
        message: 'Project updated successfully',
        data: project
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteProject(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const projectId = parseInt(req.params.id);
      
      if (isNaN(projectId)) {
        throw new ValidationError('Invalid project ID');
      }

      await projectService.deleteProject(
        projectId,
        req.user!.role,
        req.user!.id
      );

      res.json({
        success: true,
        message: 'Project deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async getProjectStats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const projectId = parseInt(req.params.id);
      
      if (isNaN(projectId)) {
        throw new ValidationError('Invalid project ID');
      }

      const stats = await projectService.getProjectStats(projectId);

      res.json({
        success: true,
        message: 'Project statistics retrieved successfully',
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  async approveProject(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const projectId = parseInt(req.params.id);
      
      if (isNaN(projectId)) {
        throw new ValidationError('Invalid project ID');
      }

      const project = await projectService.approveProject(
        projectId,
        req.user!.id,
        req.user!.role
      );

      res.json({
        success: true,
        message: 'Project approved successfully',
        data: project
      });
    } catch (error) {
      next(error);
    }
  }

  async getProjectsByStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const status = req.params.status as any;
      
      if (!['Planning', 'In Progress', 'On Hold', 'Completed', 'Closed'].includes(status)) {
        throw new ValidationError('Invalid project status');
      }

      const result = await projectService.getProjects(
        { status },
        { page: 1, limit: 100 },
        req.user!.role,
        req.user!.id
      );

      res.json({
        success: true,
        message: `Projects with status '${status}' retrieved successfully`,
        data: result.projects
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyProjects(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      let filters: any = {};

      // Filter based on user role
      if (req.user!.role === 'Customer') {
        filters.clientId = req.user!.id;
      } else if (req.user!.role === 'Project Manager') {
        filters.projectManagerId = req.user!.id;
      }

      const result = await projectService.getProjects(
        filters,
        { page: 1, limit: 100 },
        req.user!.role,
        req.user!.id
      );

      res.json({
        success: true,
        message: 'Your projects retrieved successfully',
        data: result.projects
      });
    } catch (error) {
      next(error);
    }
  }

  async searchProjects(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const searchTerm = req.query.q as string;
      
      if (!searchTerm || searchTerm.trim().length < 2) {
        throw new ValidationError('Search term must be at least 2 characters long');
      }

      const result = await projectService.getProjects(
        { search: searchTerm.trim() },
        { page: 1, limit: 50 },
        req.user!.role,
        req.user!.id
      );

      res.json({
        success: true,
        message: 'Search results retrieved successfully',
        data: result.projects
      });
    } catch (error) {
      next(error);
    }
  }

  async requestApproval(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const projectId = parseInt(req.params.id);
      
      if (isNaN(projectId)) {
        throw new ValidationError('Invalid project ID');
      }

      const approvals = await projectService.requestProjectApproval(
        projectId,
        req.user!.id,
        req.user!.role
      );

      res.json({
        success: true,
        message: 'Approval request submitted successfully',
        data: approvals
      });
    } catch (error) {
      next(error);
    }
  }

  async processApproval(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const approvalId = parseInt(req.params.approvalId);
      
      if (isNaN(approvalId)) {
        throw new ValidationError('Invalid approval ID');
      }

      // Validate request body
      const { error, value } = approvalDecisionSchema.validate(req.body);
      if (error) {
        throw new ValidationError('Validation failed', error.details);
      }

      const { decision, comments } = value;

      const result = await projectService.processProjectApproval(
        approvalId,
        req.user!.id,
        decision,
        comments
      );

      res.json({
        success: true,
        message: `Project ${decision.toLowerCase()} successfully`,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async getProjectApprovals(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const projectId = parseInt(req.params.id);
      
      if (isNaN(projectId)) {
        throw new ValidationError('Invalid project ID');
      }

      const approvals = await projectService.getProjectApprovals(projectId);

      res.json({
        success: true,
        message: 'Project approvals retrieved successfully',
        data: approvals
      });
    } catch (error) {
      next(error);
    }
  }

  async getPendingApprovals(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const approvals = await projectService.getPendingApprovals(req.user!.id);

      res.json({
        success: true,
        message: 'Pending approvals retrieved successfully',
        data: approvals
      });
    } catch (error) {
      next(error);
    }
  }

  async getProjectTimeline(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const projectId = parseInt(req.params.id);
      
      if (isNaN(projectId)) {
        throw new ValidationError('Invalid project ID');
      }

      const timeline = await projectService.getProjectTimeline(projectId);

      res.json({
        success: true,
        message: 'Project timeline retrieved successfully',
        data: timeline
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProjectBudget(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const projectId = parseInt(req.params.id);
      
      if (isNaN(projectId)) {
        throw new ValidationError('Invalid project ID');
      }

      // Validate request body
      const { error, value } = budgetUpdateSchema.validate(req.body);
      if (error) {
        throw new ValidationError('Validation failed', error.details);
      }

      const { actualCost } = value;

      const project = await projectService.updateProjectBudget(
        projectId,
        actualCost,
        req.user!.id,
        req.user!.role
      );

      res.json({
        success: true,
        message: 'Project budget updated successfully',
        data: project
      });
    } catch (error) {
      next(error);
    }
  }
}

export const projectController = new ProjectController();