import { Op, Transaction } from 'sequelize';
import { 
  Task, 
  TaskDependency, 
  TaskApproval, 
  TimeLog, 
  User, 
  Project,
  TaskStatus, 
  TaskPriority,
  TaskApprovalStatus 
} from '../models';
import { sequelize } from '../config/database';
import { ValidationError, NotFoundError, ConflictError } from '../middleware/errorHandler';
import { emailService } from './emailService';

interface CreateTaskData {
  projectId: number;
  title: string;
  description?: string;
  assignedTo?: number;
  priority?: TaskPriority;
  startDate?: Date;
  dueDate?: Date;
  estimatedHours?: number;
  dependencies?: number[];
}

interface UpdateTaskData {
  title?: string;
  description?: string;
  assignedTo?: number;
  status?: TaskStatus;
  priority?: TaskPriority;
  startDate?: Date;
  dueDate?: Date;
  completionPercentage?: number;
  estimatedHours?: number;
  dependencies?: number[];
}

interface TaskFilters {
  projectId?: number;
  assignedTo?: number;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDateFrom?: Date;
  dueDateTo?: Date;
  search?: string;
}

interface TimeLogData {
  taskId: number;
  userId: number;
  startTime?: Date;
  description?: string;
}

class TaskService {
  async createTask(taskData: CreateTaskData, createdBy: number): Promise<Task> {
    const transaction = await sequelize.transaction();
    
    try {
      // Validate project exists
      const project = await Project.findByPk(taskData.projectId);
      if (!project) {
        throw new NotFoundError('Project not found');
      }

      // Validate assigned user exists if provided
      if (taskData.assignedTo) {
        const assignee = await User.findByPk(taskData.assignedTo);
        if (!assignee) {
          throw new NotFoundError('Assigned user not found');
        }
      }

      // Validate dependencies exist and are in the same project
      if (taskData.dependencies && taskData.dependencies.length > 0) {
        const dependencyTasks = await Task.findAll({
          where: {
            id: { [Op.in]: taskData.dependencies },
            projectId: taskData.projectId
          }
        });

        if (dependencyTasks.length !== taskData.dependencies.length) {
          throw new ValidationError('One or more dependency tasks not found or not in the same project');
        }
      }

      // Create the task
      const task = await Task.create({
        ...taskData,
        createdBy,
        status: 'Not Started',
        completionPercentage: 0,
        actualHours: 0
      }, { transaction });

      // Create dependencies if provided
      if (taskData.dependencies && taskData.dependencies.length > 0) {
        const dependencyRecords = taskData.dependencies.map(depId => ({
          taskId: task.id,
          dependsOnTaskId: depId
        }));
        
        await TaskDependency.bulkCreate(dependencyRecords, { transaction });
      }

      await transaction.commit();

      // Send notification to assignee if task is assigned
      if (taskData.assignedTo) {
        await this.sendTaskAssignmentNotification(task.id, taskData.assignedTo);
      }

      return await this.getTaskById(task.id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async updateTask(taskId: number, updateData: UpdateTaskData, userId: number): Promise<Task> {
    const transaction = await sequelize.transaction();
    
    try {
      const task = await Task.findByPk(taskId, {
        include: [
          { model: TaskDependency, as: 'dependencies' },
          { model: User, as: 'assignee' }
        ]
      });

      if (!task) {
        throw new NotFoundError('Task not found');
      }

      // Check if user can update this task (assignee, creator, or project manager)
      const canUpdate = await this.canUserUpdateTask(taskId, userId);
      if (!canUpdate) {
        throw new ValidationError('You do not have permission to update this task');
      }

      // Validate status transitions and dependencies
      if (updateData.status && updateData.status !== task.status) {
        await this.validateStatusTransition(task, updateData.status);
      }

      // Validate assigned user exists if provided
      if (updateData.assignedTo) {
        const assignee = await User.findByPk(updateData.assignedTo);
        if (!assignee) {
          throw new NotFoundError('Assigned user not found');
        }
      }

      // Handle dependencies update
      if (updateData.dependencies !== undefined) {
        // Remove existing dependencies
        await TaskDependency.destroy({
          where: { taskId },
          transaction
        });

        // Add new dependencies if provided
        if (updateData.dependencies.length > 0) {
          // Validate dependencies exist and are in the same project
          const dependencyTasks = await Task.findAll({
            where: {
              id: { [Op.in]: updateData.dependencies },
              projectId: task.projectId
            }
          });

          if (dependencyTasks.length !== updateData.dependencies.length) {
            throw new ValidationError('One or more dependency tasks not found or not in the same project');
          }

          // Check for circular dependencies
          await this.validateNoCyclicDependencies(taskId, updateData.dependencies);

          const dependencyRecords = updateData.dependencies.map(depId => ({
            taskId,
            dependsOnTaskId: depId
          }));
          
          await TaskDependency.bulkCreate(dependencyRecords, { transaction });
        }
      }

      // Update completion percentage based on status
      if (updateData.status === 'Completed' && updateData.completionPercentage === undefined) {
        updateData.completionPercentage = 100;
      } else if (updateData.status === 'Not Started' && updateData.completionPercentage === undefined) {
        updateData.completionPercentage = 0;
      }

      // Update actual hours from time logs
      if (updateData.completionPercentage !== undefined) {
        await this.updateActualHoursFromTimeLogs(taskId, transaction);
      }

      // Update the task
      await task.update(updateData, { transaction });

      await transaction.commit();

      // Send notifications for assignment changes
      if (updateData.assignedTo && updateData.assignedTo !== task.assignedTo) {
        await this.sendTaskAssignmentNotification(taskId, updateData.assignedTo);
      }

      // Send deadline notifications if due date is approaching
      if (updateData.dueDate) {
        await this.checkAndSendDeadlineNotifications(taskId);
      }

      return await this.getTaskById(taskId);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async deleteTask(taskId: number, userId: number): Promise<void> {
    const task = await Task.findByPk(taskId);
    if (!task) {
      throw new NotFoundError('Task not found');
    }

    // Check if user can delete this task (creator or project manager)
    const canDelete = await this.canUserDeleteTask(taskId, userId);
    if (!canDelete) {
      throw new ValidationError('You do not have permission to delete this task');
    }

    // Check if task has dependents
    const dependents = await TaskDependency.findAll({
      where: { dependsOnTaskId: taskId }
    });

    if (dependents.length > 0) {
      throw new ConflictError('Cannot delete task that has dependent tasks');
    }

    await task.destroy();
  }

  async getTaskById(taskId: number): Promise<Task> {
    const task = await Task.findByPk(taskId, {
      include: [
        { model: Project, as: 'project' },
        { model: User, as: 'assignee', include: [{ model: User, as: 'profile' }] },
        { model: User, as: 'creator', include: [{ model: User, as: 'profile' }] },
        { 
          model: TaskDependency, 
          as: 'dependencies',
          include: [{ model: Task, as: 'dependsOnTask' }]
        },
        { 
          model: TaskApproval, 
          as: 'approvals',
          include: [
            { model: User, as: 'requester' },
            { model: User, as: 'approver' }
          ]
        },
        { 
          model: TimeLog, 
          as: 'timeLogs',
          include: [{ model: User, as: 'user' }]
        }
      ]
    });

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    return task;
  }

  async getTasks(filters: TaskFilters, page: number = 1, limit: number = 10): Promise<{ tasks: Task[], total: number, totalPages: number }> {
    const offset = (page - 1) * limit;
    const whereClause: any = {};

    // Apply filters
    if (filters.projectId) whereClause.projectId = filters.projectId;
    if (filters.assignedTo) whereClause.assignedTo = filters.assignedTo;
    if (filters.status) whereClause.status = filters.status;
    if (filters.priority) whereClause.priority = filters.priority;
    
    if (filters.dueDateFrom || filters.dueDateTo) {
      whereClause.dueDate = {};
      if (filters.dueDateFrom) whereClause.dueDate[Op.gte] = filters.dueDateFrom;
      if (filters.dueDateTo) whereClause.dueDate[Op.lte] = filters.dueDateTo;
    }

    if (filters.search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${filters.search}%` } },
        { description: { [Op.like]: `%${filters.search}%` } }
      ];
    }

    const { count, rows } = await Task.findAndCountAll({
      where: whereClause,
      include: [
        { model: Project, as: 'project' },
        { model: User, as: 'assignee' },
        { model: User, as: 'creator' }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    return {
      tasks: rows,
      total: count,
      totalPages: Math.ceil(count / limit)
    };
  }

  // Task Approval Methods
  async requestTaskApproval(taskId: number, requestedBy: number, comments?: string): Promise<TaskApproval> {
    const task = await Task.findByPk(taskId);
    if (!task) {
      throw new NotFoundError('Task not found');
    }

    // Check if there's already a pending approval
    const existingApproval = await TaskApproval.findOne({
      where: {
        taskId,
        status: 'Pending'
      }
    });

    if (existingApproval) {
      throw new ConflictError('Task already has a pending approval request');
    }

    const approval = await TaskApproval.create({
      taskId,
      requestedBy,
      comments,
      status: 'Pending',
      requestedAt: new Date()
    });

    // Send notification to project manager or supervisor
    await this.sendApprovalRequestNotification(taskId, requestedBy);

    return approval;
  }

  async respondToTaskApproval(approvalId: number, approvedBy: number, status: 'Approved' | 'Declined', comments?: string): Promise<TaskApproval> {
    const approval = await TaskApproval.findByPk(approvalId, {
      include: [{ model: Task, as: 'task' }]
    });

    if (!approval) {
      throw new NotFoundError('Approval request not found');
    }

    if (approval.status !== 'Pending') {
      throw new ConflictError('Approval request has already been responded to');
    }

    // Check if user can approve this task
    const canApprove = await this.canUserApproveTask(approval.taskId, approvedBy);
    if (!canApprove) {
      throw new ValidationError('You do not have permission to approve this task');
    }

    await approval.update({
      approvedBy,
      status,
      comments,
      respondedAt: new Date()
    });

    // Send notification to requester
    await this.sendApprovalResponseNotification(approval.taskId, approval.requestedBy, status);

    return approval;
  }

  // Time Logging Methods
  async startTimeLog(timeLogData: TimeLogData): Promise<TimeLog> {
    // Check if user already has an active time log for this task
    const activeTimeLog = await TimeLog.findOne({
      where: {
        taskId: timeLogData.taskId,
        userId: timeLogData.userId,
        isActive: true
      }
    });

    if (activeTimeLog) {
      throw new ConflictError('User already has an active time log for this task');
    }

    // Check if task exists and user can log time
    const task = await Task.findByPk(timeLogData.taskId);
    if (!task) {
      throw new NotFoundError('Task not found');
    }

    const timeLog = await TimeLog.create({
      ...timeLogData,
      startTime: timeLogData.startTime || new Date(),
      isActive: true
    });

    return timeLog;
  }

  async stopTimeLog(timeLogId: number, userId: number, description?: string): Promise<TimeLog> {
    const timeLog = await TimeLog.findByPk(timeLogId);
    if (!timeLog) {
      throw new NotFoundError('Time log not found');
    }

    if (timeLog.userId !== userId) {
      throw new ValidationError('You can only stop your own time logs');
    }

    if (!timeLog.isActive) {
      throw new ConflictError('Time log is not active');
    }

    await timeLog.stopLogging();
    
    if (description) {
      await timeLog.update({ description });
    }

    // Update task's actual hours
    await this.updateActualHoursFromTimeLogs(timeLog.taskId);

    return timeLog;
  }

  async getTimeLogsForTask(taskId: number): Promise<TimeLog[]> {
    return await TimeLog.findAll({
      where: { taskId },
      include: [{ model: User, as: 'user' }],
      order: [['startTime', 'DESC']]
    });
  }

  async getTimeLogsForUser(userId: number, filters?: { taskId?: number, dateFrom?: Date, dateTo?: Date }): Promise<TimeLog[]> {
    const whereClause: any = { userId };
    
    if (filters?.taskId) whereClause.taskId = filters.taskId;
    if (filters?.dateFrom || filters?.dateTo) {
      whereClause.startTime = {};
      if (filters.dateFrom) whereClause.startTime[Op.gte] = filters.dateFrom;
      if (filters.dateTo) whereClause.startTime[Op.lte] = filters.dateTo;
    }

    return await TimeLog.findAll({
      where: whereClause,
      include: [
        { model: Task, as: 'task', include: [{ model: Project, as: 'project' }] },
        { model: User, as: 'user' }
      ],
      order: [['startTime', 'DESC']]
    });
  }

  // Private helper methods
  private async canUserUpdateTask(taskId: number, userId: number): Promise<boolean> {
    const task = await Task.findByPk(taskId, {
      include: [{ model: Project, as: 'project' }]
    });

    if (!task) return false;

    // Task assignee, creator, or project manager can update
    return task.assignedTo === userId || 
           task.createdBy === userId || 
           task.project?.projectManagerId === userId;
  }

  private async canUserDeleteTask(taskId: number, userId: number): Promise<boolean> {
    const task = await Task.findByPk(taskId, {
      include: [{ model: Project, as: 'project' }]
    });

    if (!task) return false;

    // Only creator or project manager can delete
    return task.createdBy === userId || task.project?.projectManagerId === userId;
  }

  private async canUserApproveTask(taskId: number, userId: number): Promise<boolean> {
    const task = await Task.findByPk(taskId, {
      include: [{ model: Project, as: 'project' }]
    });

    if (!task) return false;

    // Project manager or supervisor can approve
    return task.project?.projectManagerId === userId;
  }

  private async validateStatusTransition(task: Task, newStatus: TaskStatus): Promise<void> {
    // Check dependencies for status transitions
    if (newStatus === 'In Progress' || newStatus === 'Completed') {
      const dependencies = await TaskDependency.findAll({
        where: { taskId: task.id },
        include: [{ model: Task, as: 'dependsOnTask' }]
      });

      const incompleteDependencies = dependencies.filter(dep => 
        dep.dependsOnTask && dep.dependsOnTask.status !== 'Completed'
      );

      if (incompleteDependencies.length > 0) {
        throw new ValidationError('Cannot start or complete task while dependencies are incomplete');
      }
    }
  }

  private async validateNoCyclicDependencies(taskId: number, dependencyIds: number[]): Promise<void> {
    // Simple cycle detection - check if any dependency has taskId as its dependency
    for (const depId of dependencyIds) {
      const cyclicCheck = await this.hasCyclicDependency(depId, taskId, new Set());
      if (cyclicCheck) {
        throw new ValidationError('Circular dependency detected');
      }
    }
  }

  private async hasCyclicDependency(currentTaskId: number, targetTaskId: number, visited: Set<number>): Promise<boolean> {
    if (visited.has(currentTaskId)) return false;
    if (currentTaskId === targetTaskId) return true;

    visited.add(currentTaskId);

    const dependencies = await TaskDependency.findAll({
      where: { taskId: currentTaskId }
    });

    for (const dep of dependencies) {
      if (await this.hasCyclicDependency(dep.dependsOnTaskId, targetTaskId, visited)) {
        return true;
      }
    }

    return false;
  }

  private async updateActualHoursFromTimeLogs(taskId: number, transaction?: Transaction): Promise<void> {
    const timeLogs = await TimeLog.findAll({
      where: { 
        taskId,
        isActive: false,
        duration: { [Op.not]: null }
      },
      transaction
    });

    const totalMinutes = timeLogs.reduce((sum, log) => sum + (log.duration || 0), 0);
    const totalHours = totalMinutes / 60;

    await Task.update(
      { actualHours: totalHours },
      { where: { id: taskId }, transaction }
    );
  }

  private async sendTaskAssignmentNotification(taskId: number, assigneeId: number): Promise<void> {
    try {
      const task = await this.getTaskById(taskId);
      const assignee = await User.findByPk(assigneeId);
      
      if (assignee && assignee.email) {
        await emailService.sendEmail({
          to: assignee.email,
          subject: `New Task Assigned: ${task.title}`,
          html: `
            <h2>New Task Assignment</h2>
            <p>You have been assigned a new task:</p>
            <h3>${task.title}</h3>
            <p><strong>Project:</strong> ${task.project?.name}</p>
            <p><strong>Priority:</strong> ${task.priority}</p>
            <p><strong>Due Date:</strong> ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Not set'}</p>
            ${task.description ? `<p><strong>Description:</strong> ${task.description}</p>` : ''}
          `
        });
      }
    } catch (error) {
      console.error('Failed to send task assignment notification:', error);
    }
  }

  private async sendApprovalRequestNotification(taskId: number, requesterId: number): Promise<void> {
    try {
      const task = await this.getTaskById(taskId);
      const requester = await User.findByPk(requesterId);
      
      // Send to project manager
      if (task.project?.projectManagerId) {
        const projectManager = await User.findByPk(task.project.projectManagerId);
        if (projectManager && projectManager.email) {
          await emailService.sendEmail({
            to: projectManager.email,
            subject: `Task Approval Request: ${task.title}`,
            html: `
              <h2>Task Approval Request</h2>
              <p>${requester?.email} has requested approval for task:</p>
              <h3>${task.title}</h3>
              <p><strong>Project:</strong> ${task.project?.name}</p>
              <p><strong>Status:</strong> ${task.status}</p>
              <p><strong>Completion:</strong> ${task.completionPercentage}%</p>
            `
          });
        }
      }
    } catch (error) {
      console.error('Failed to send approval request notification:', error);
    }
  }

  private async sendApprovalResponseNotification(taskId: number, requesterId: number, status: 'Approved' | 'Declined'): Promise<void> {
    try {
      const task = await this.getTaskById(taskId);
      const requester = await User.findByPk(requesterId);
      
      if (requester && requester.email) {
        await emailService.sendEmail({
          to: requester.email,
          subject: `Task ${status}: ${task.title}`,
          html: `
            <h2>Task ${status}</h2>
            <p>Your approval request for task "${task.title}" has been ${status.toLowerCase()}.</p>
            <p><strong>Project:</strong> ${task.project?.name}</p>
          `
        });
      }
    } catch (error) {
      console.error('Failed to send approval response notification:', error);
    }
  }

  private async checkAndSendDeadlineNotifications(taskId: number): Promise<void> {
    try {
      const task = await this.getTaskById(taskId);
      
      if (task.dueDate && task.assignedTo) {
        const now = new Date();
        const dueDate = new Date(task.dueDate);
        const timeDiff = dueDate.getTime() - now.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

        // Send notification if due date is within 2 days
        if (daysDiff <= 2 && daysDiff > 0 && task.status !== 'Completed') {
          const assignee = await User.findByPk(task.assignedTo);
          if (assignee && assignee.email) {
            await emailService.sendEmail({
              to: assignee.email,
              subject: `Task Deadline Approaching: ${task.title}`,
              html: `
                <h2>Task Deadline Reminder</h2>
                <p>Your task "${task.title}" is due in ${daysDiff} day(s).</p>
                <p><strong>Due Date:</strong> ${dueDate.toLocaleDateString()}</p>
                <p><strong>Current Status:</strong> ${task.status}</p>
                <p><strong>Completion:</strong> ${task.completionPercentage}%</p>
              `
            });
          }
        }
      }
    } catch (error) {
      console.error('Failed to send deadline notification:', error);
    }
  }
}

export const taskService = new TaskService();