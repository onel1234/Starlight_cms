import { Request, Response, NextFunction } from 'express';
import { taskService } from '../services/taskService';
import { ValidationError } from '../middleware/errorHandler';
import Joi from 'joi';

// Validation schemas
const createTaskSchema = Joi.object({
  projectId: Joi.number().integer().positive().required(),
  title: Joi.string().min(1).max(255).required(),
  description: Joi.string().max(1000).optional(),
  assignedTo: Joi.number().integer().positive().optional(),
  priority: Joi.string().valid('Low', 'Medium', 'High', 'Critical').optional(),
  startDate: Joi.date().optional(),
  dueDate: Joi.date().min(Joi.ref('startDate')).optional(),
  estimatedHours: Joi.number().positive().optional(),
  dependencies: Joi.array().items(Joi.number().integer().positive()).optional()
});

const updateTaskSchema = Joi.object({
  title: Joi.string().min(1).max(255).optional(),
  description: Joi.string().max(1000).optional(),
  assignedTo: Joi.number().integer().positive().optional(),
  status: Joi.string().valid('Not Started', 'In Progress', 'Completed', 'On Hold').optional(),
  priority: Joi.string().valid('Low', 'Medium', 'High', 'Critical').optional(),
  startDate: Joi.date().optional(),
  dueDate: Joi.date().optional(),
  completionPercentage: Joi.number().min(0).max(100).optional(),
  estimatedHours: Joi.number().positive().optional(),
  dependencies: Joi.array().items(Joi.number().integer().positive()).optional()
});

const taskFiltersSchema = Joi.object({
  projectId: Joi.number().integer().positive().optional(),
  assignedTo: Joi.number().integer().positive().optional(),
  status: Joi.string().valid('Not Started', 'In Progress', 'Completed', 'On Hold').optional(),
  priority: Joi.string().valid('Low', 'Medium', 'High', 'Critical').optional(),
  dueDateFrom: Joi.date().optional(),
  dueDateTo: Joi.date().min(Joi.ref('dueDateFrom')).optional(),
  search: Joi.string().max(255).optional(),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional()
});

const approvalRequestSchema = Joi.object({
  comments: Joi.string().max(1000).optional()
});

const approvalResponseSchema = Joi.object({
  status: Joi.string().valid('Approved', 'Declined').required(),
  comments: Joi.string().max(1000).optional()
});

const timeLogSchema = Joi.object({
  taskId: Joi.number().integer().positive().required(),
  startTime: Joi.date().optional(),
  description: Joi.string().max(500).optional()
});

const stopTimeLogSchema = Joi.object({
  description: Joi.string().max(500).optional()
});

class TaskController {
  async createTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { error, value } = createTaskSchema.validate(req.body);
      if (error) {
        throw new ValidationError(error.details[0].message);
      }

      const userId = req.user?.id;
      if (!userId) {
        throw new ValidationError('User not authenticated');
      }

      const task = await taskService.createTask(value, userId);
      
      res.status(201).json({
        success: true,
        data: task,
        message: 'Task created successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async updateTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const taskId = parseInt(req.params.id);
      if (isNaN(taskId)) {
        throw new ValidationError('Invalid task ID');
      }

      const { error, value } = updateTaskSchema.validate(req.body);
      if (error) {
        throw new ValidationError(error.details[0].message);
      }

      const userId = req.user?.id;
      if (!userId) {
        throw new ValidationError('User not authenticated');
      }

      const task = await taskService.updateTask(taskId, value, userId);
      
      res.json({
        success: true,
        data: task,
        message: 'Task updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const taskId = parseInt(req.params.id);
      if (isNaN(taskId)) {
        throw new ValidationError('Invalid task ID');
      }

      const userId = req.user?.id;
      if (!userId) {
        throw new ValidationError('User not authenticated');
      }

      await taskService.deleteTask(taskId, userId);
      
      res.json({
        success: true,
        message: 'Task deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async getTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const taskId = parseInt(req.params.id);
      if (isNaN(taskId)) {
        throw new ValidationError('Invalid task ID');
      }

      const task = await taskService.getTaskById(taskId);
      
      res.json({
        success: true,
        data: task
      });
    } catch (error) {
      next(error);
    }
  }

  async getTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { error, value } = taskFiltersSchema.validate(req.query);
      if (error) {
        throw new ValidationError(error.details[0].message);
      }

      const { page = 1, limit = 10, ...filters } = value;
      const result = await taskService.getTasks(filters, page, limit);
      
      res.json({
        success: true,
        data: result.tasks,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: result.totalPages
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Task Approval endpoints
  async requestApproval(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const taskId = parseInt(req.params.id);
      if (isNaN(taskId)) {
        throw new ValidationError('Invalid task ID');
      }

      const { error, value } = approvalRequestSchema.validate(req.body);
      if (error) {
        throw new ValidationError(error.details[0].message);
      }

      const userId = req.user?.id;
      if (!userId) {
        throw new ValidationError('User not authenticated');
      }

      const approval = await taskService.requestTaskApproval(taskId, userId, value.comments);
      
      res.status(201).json({
        success: true,
        data: approval,
        message: 'Approval request submitted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async respondToApproval(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const approvalId = parseInt(req.params.approvalId);
      if (isNaN(approvalId)) {
        throw new ValidationError('Invalid approval ID');
      }

      const { error, value } = approvalResponseSchema.validate(req.body);
      if (error) {
        throw new ValidationError(error.details[0].message);
      }

      const userId = req.user?.id;
      if (!userId) {
        throw new ValidationError('User not authenticated');
      }

      const approval = await taskService.respondToTaskApproval(
        approvalId, 
        userId, 
        value.status, 
        value.comments
      );
      
      res.json({
        success: true,
        data: approval,
        message: `Task ${value.status.toLowerCase()} successfully`
      });
    } catch (error) {
      next(error);
    }
  }

  // Time logging endpoints
  async startTimeLog(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { error, value } = timeLogSchema.validate(req.body);
      if (error) {
        throw new ValidationError(error.details[0].message);
      }

      const userId = req.user?.id;
      if (!userId) {
        throw new ValidationError('User not authenticated');
      }

      const timeLog = await taskService.startTimeLog({
        ...value,
        userId
      });
      
      res.status(201).json({
        success: true,
        data: timeLog,
        message: 'Time logging started successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async stopTimeLog(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const timeLogId = parseInt(req.params.timeLogId);
      if (isNaN(timeLogId)) {
        throw new ValidationError('Invalid time log ID');
      }

      const { error, value } = stopTimeLogSchema.validate(req.body);
      if (error) {
        throw new ValidationError(error.details[0].message);
      }

      const userId = req.user?.id;
      if (!userId) {
        throw new ValidationError('User not authenticated');
      }

      const timeLog = await taskService.stopTimeLog(timeLogId, userId, value.description);
      
      res.json({
        success: true,
        data: timeLog,
        message: 'Time logging stopped successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async getTaskTimeLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const taskId = parseInt(req.params.id);
      if (isNaN(taskId)) {
        throw new ValidationError('Invalid task ID');
      }

      const timeLogs = await taskService.getTimeLogsForTask(taskId);
      
      res.json({
        success: true,
        data: timeLogs
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserTimeLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new ValidationError('User not authenticated');
      }

      const filters: any = {};
      if (req.query.taskId) {
        filters.taskId = parseInt(req.query.taskId as string);
      }
      if (req.query.dateFrom) {
        filters.dateFrom = new Date(req.query.dateFrom as string);
      }
      if (req.query.dateTo) {
        filters.dateTo = new Date(req.query.dateTo as string);
      }

      const timeLogs = await taskService.getTimeLogsForUser(userId, filters);
      
      res.json({
        success: true,
        data: timeLogs
      });
    } catch (error) {
      next(error);
    }
  }

  // Task progress and completion percentage update
  async updateProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const taskId = parseInt(req.params.id);
      if (isNaN(taskId)) {
        throw new ValidationError('Invalid task ID');
      }

      const progressSchema = Joi.object({
        completionPercentage: Joi.number().min(0).max(100).required()
      });

      const { error, value } = progressSchema.validate(req.body);
      if (error) {
        throw new ValidationError(error.details[0].message);
      }

      const userId = req.user?.id;
      if (!userId) {
        throw new ValidationError('User not authenticated');
      }

      const task = await taskService.updateTask(taskId, { 
        completionPercentage: value.completionPercentage 
      }, userId);
      
      res.json({
        success: true,
        data: task,
        message: 'Task progress updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}

export const taskController = new TaskController();