import { taskService } from '../services/taskService';
import { Task, TaskDependency, TaskApproval, TimeLog, User, Project } from '../models';
import { sequelize } from '../config/database';
import { ValidationError, NotFoundError, ConflictError } from '../middleware/errorHandler';

describe('TaskService', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    // Clean up database before each test
    await TimeLog.destroy({ where: {} });
    await TaskApproval.destroy({ where: {} });
    await TaskDependency.destroy({ where: {} });
    await Task.destroy({ where: {} });
    await Project.destroy({ where: {} });
    await User.destroy({ where: {} });
  });

  describe('createTask', () => {
    let user: User;
    let project: Project;

    beforeEach(async () => {
      user = await User.create({
        email: 'test@example.com',
        passwordHash: 'hashedpassword',
        role: 'Project Manager',
        status: 'Active',
        emailVerified: true
      });

      project = await Project.create({
        name: 'Test Project',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        budget: 10000,
        status: 'Planning',
        createdBy: user.id
      });
    });

    it('should create a task successfully', async () => {
      const taskData = {
        projectId: project.id,
        title: 'Test Task',
        description: 'Test task description',
        assignedTo: user.id,
        priority: 'Medium' as const,
        estimatedHours: 8
      };

      const task = await taskService.createTask(taskData, user.id);

      expect(task).toBeDefined();
      expect(task.title).toBe(taskData.title);
      expect(task.projectId).toBe(project.id);
      expect(task.assignedTo).toBe(user.id);
      expect(task.status).toBe('Not Started');
      expect(task.completionPercentage).toBe(0);
    });

    it('should create task with dependencies', async () => {
      // Create dependency task first
      const depTask = await Task.create({
        projectId: project.id,
        title: 'Dependency Task',
        status: 'Not Started',
        priority: 'Medium',
        completionPercentage: 0,
        actualHours: 0,
        createdBy: user.id
      });

      const taskData = {
        projectId: project.id,
        title: 'Test Task',
        dependencies: [depTask.id]
      };

      const task = await taskService.createTask(taskData, user.id);
      const taskWithDeps = await taskService.getTaskById(task.id);

      expect(taskWithDeps.dependencies).toHaveLength(1);
      expect(taskWithDeps.dependencies![0].dependsOnTaskId).toBe(depTask.id);
    });

    it('should throw error for non-existent project', async () => {
      const taskData = {
        projectId: 999,
        title: 'Test Task'
      };

      await expect(taskService.createTask(taskData, user.id))
        .rejects.toThrow(NotFoundError);
    });

    it('should throw error for non-existent assignee', async () => {
      const taskData = {
        projectId: project.id,
        title: 'Test Task',
        assignedTo: 999
      };

      await expect(taskService.createTask(taskData, user.id))
        .rejects.toThrow(NotFoundError);
    });
  });

  describe('updateTask', () => {
    let user: User;
    let project: Project;
    let task: Task;

    beforeEach(async () => {
      user = await User.create({
        email: 'test@example.com',
        passwordHash: 'hashedpassword',
        role: 'Project Manager',
        status: 'Active',
        emailVerified: true
      });

      project = await Project.create({
        name: 'Test Project',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        budget: 10000,
        status: 'Planning',
        createdBy: user.id,
        projectManagerId: user.id
      });

      task = await Task.create({
        projectId: project.id,
        title: 'Test Task',
        status: 'Not Started',
        priority: 'Medium',
        completionPercentage: 0,
        actualHours: 0,
        createdBy: user.id,
        assignedTo: user.id
      });
    });

    it('should update task successfully', async () => {
      const updateData = {
        title: 'Updated Task',
        status: 'In Progress' as const,
        completionPercentage: 50
      };

      const updatedTask = await taskService.updateTask(task.id, updateData, user.id);

      expect(updatedTask.title).toBe(updateData.title);
      expect(updatedTask.status).toBe(updateData.status);
      expect(updatedTask.completionPercentage).toBe(updateData.completionPercentage);
    });

    it('should prevent status change when dependencies are incomplete', async () => {
      // Create dependency task
      const depTask = await Task.create({
        projectId: project.id,
        title: 'Dependency Task',
        status: 'Not Started',
        priority: 'Medium',
        completionPercentage: 0,
        actualHours: 0,
        createdBy: user.id
      });

      // Add dependency
      await TaskDependency.create({
        taskId: task.id,
        dependsOnTaskId: depTask.id
      });

      const updateData = {
        status: 'In Progress' as const
      };

      await expect(taskService.updateTask(task.id, updateData, user.id))
        .rejects.toThrow(ValidationError);
    });

    it('should allow status change when dependencies are complete', async () => {
      // Create completed dependency task
      const depTask = await Task.create({
        projectId: project.id,
        title: 'Dependency Task',
        status: 'Completed',
        priority: 'Medium',
        completionPercentage: 100,
        actualHours: 0,
        createdBy: user.id
      });

      // Add dependency
      await TaskDependency.create({
        taskId: task.id,
        dependsOnTaskId: depTask.id
      });

      const updateData = {
        status: 'In Progress' as const
      };

      const updatedTask = await taskService.updateTask(task.id, updateData, user.id);
      expect(updatedTask.status).toBe('In Progress');
    });

    it('should prevent circular dependencies', async () => {
      const task2 = await Task.create({
        projectId: project.id,
        title: 'Task 2',
        status: 'Not Started',
        priority: 'Medium',
        completionPercentage: 0,
        actualHours: 0,
        createdBy: user.id
      });

      // Create dependency: task2 depends on task
      await TaskDependency.create({
        taskId: task2.id,
        dependsOnTaskId: task.id
      });

      // Try to create circular dependency: task depends on task2
      const updateData = {
        dependencies: [task2.id]
      };

      await expect(taskService.updateTask(task.id, updateData, user.id))
        .rejects.toThrow(ValidationError);
    });
  });

  describe('Task Approval Workflow', () => {
    let user: User;
    let approver: User;
    let project: Project;
    let task: Task;

    beforeEach(async () => {
      user = await User.create({
        email: 'user@example.com',
        passwordHash: 'hashedpassword',
        role: 'Employee',
        status: 'Active',
        emailVerified: true
      });

      approver = await User.create({
        email: 'approver@example.com',
        passwordHash: 'hashedpassword',
        role: 'Project Manager',
        status: 'Active',
        emailVerified: true
      });

      project = await Project.create({
        name: 'Test Project',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        budget: 10000,
        status: 'Planning',
        createdBy: approver.id,
        projectManagerId: approver.id
      });

      task = await Task.create({
        projectId: project.id,
        title: 'Test Task',
        status: 'In Progress',
        priority: 'Medium',
        completionPercentage: 80,
        actualHours: 0,
        createdBy: user.id,
        assignedTo: user.id
      });
    });

    it('should create approval request successfully', async () => {
      const approval = await taskService.requestTaskApproval(task.id, user.id, 'Task completed');

      expect(approval).toBeDefined();
      expect(approval.taskId).toBe(task.id);
      expect(approval.requestedBy).toBe(user.id);
      expect(approval.status).toBe('Pending');
      expect(approval.comments).toBe('Task completed');
    });

    it('should prevent duplicate approval requests', async () => {
      await taskService.requestTaskApproval(task.id, user.id, 'Task completed');

      await expect(taskService.requestTaskApproval(task.id, user.id, 'Another request'))
        .rejects.toThrow(ConflictError);
    });

    it('should approve task successfully', async () => {
      const approval = await taskService.requestTaskApproval(task.id, user.id, 'Task completed');
      
      const response = await taskService.respondToTaskApproval(
        approval.id, 
        approver.id, 
        'Approved', 
        'Good work!'
      );

      expect(response.status).toBe('Approved');
      expect(response.approvedBy).toBe(approver.id);
      expect(response.comments).toBe('Good work!');
      expect(response.respondedAt).toBeDefined();
    });

    it('should decline task successfully', async () => {
      const approval = await taskService.requestTaskApproval(task.id, user.id, 'Task completed');
      
      const response = await taskService.respondToTaskApproval(
        approval.id, 
        approver.id, 
        'Declined', 
        'Needs more work'
      );

      expect(response.status).toBe('Declined');
      expect(response.approvedBy).toBe(approver.id);
      expect(response.comments).toBe('Needs more work');
    });

    it('should prevent responding to already responded approval', async () => {
      const approval = await taskService.requestTaskApproval(task.id, user.id, 'Task completed');
      
      await taskService.respondToTaskApproval(approval.id, approver.id, 'Approved');

      await expect(taskService.respondToTaskApproval(approval.id, approver.id, 'Declined'))
        .rejects.toThrow(ConflictError);
    });
  });

  describe('Time Logging', () => {
    let user: User;
    let project: Project;
    let task: Task;

    beforeEach(async () => {
      user = await User.create({
        email: 'user@example.com',
        passwordHash: 'hashedpassword',
        role: 'Employee',
        status: 'Active',
        emailVerified: true
      });

      project = await Project.create({
        name: 'Test Project',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        budget: 10000,
        status: 'Planning',
        createdBy: user.id
      });

      task = await Task.create({
        projectId: project.id,
        title: 'Test Task',
        status: 'In Progress',
        priority: 'Medium',
        completionPercentage: 0,
        actualHours: 0,
        createdBy: user.id,
        assignedTo: user.id
      });
    });

    it('should start time logging successfully', async () => {
      const timeLog = await taskService.startTimeLog({
        taskId: task.id,
        userId: user.id,
        description: 'Working on task'
      });

      expect(timeLog).toBeDefined();
      expect(timeLog.taskId).toBe(task.id);
      expect(timeLog.userId).toBe(user.id);
      expect(timeLog.isActive).toBe(true);
      expect(timeLog.startTime).toBeDefined();
      expect(timeLog.endTime).toBeNull();
    });

    it('should prevent multiple active time logs for same task', async () => {
      await taskService.startTimeLog({
        taskId: task.id,
        userId: user.id
      });

      await expect(taskService.startTimeLog({
        taskId: task.id,
        userId: user.id
      })).rejects.toThrow(ConflictError);
    });

    it('should stop time logging successfully', async () => {
      const timeLog = await taskService.startTimeLog({
        taskId: task.id,
        userId: user.id
      });

      const stoppedTimeLog = await taskService.stopTimeLog(
        timeLog.id, 
        user.id, 
        'Completed work session'
      );

      expect(stoppedTimeLog.isActive).toBe(false);
      expect(stoppedTimeLog.endTime).toBeDefined();
      expect(stoppedTimeLog.duration).toBeGreaterThan(0);
      expect(stoppedTimeLog.description).toBe('Completed work session');
    });

    it('should calculate duration correctly', async () => {
      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour later

      const timeLog = await TimeLog.create({
        taskId: task.id,
        userId: user.id,
        startTime,
        endTime,
        isActive: false
      });

      expect(timeLog.duration).toBe(60); // 60 minutes
    });

    it('should get time logs for task', async () => {
      await taskService.startTimeLog({
        taskId: task.id,
        userId: user.id
      });

      const timeLogs = await taskService.getTimeLogsForTask(task.id);

      expect(timeLogs).toHaveLength(1);
      expect(timeLogs[0].taskId).toBe(task.id);
    });

    it('should get time logs for user', async () => {
      await taskService.startTimeLog({
        taskId: task.id,
        userId: user.id
      });

      const timeLogs = await taskService.getTimeLogsForUser(user.id);

      expect(timeLogs).toHaveLength(1);
      expect(timeLogs[0].userId).toBe(user.id);
    });
  });

  describe('Task Filtering and Pagination', () => {
    let user: User;
    let project: Project;

    beforeEach(async () => {
      user = await User.create({
        email: 'user@example.com',
        passwordHash: 'hashedpassword',
        role: 'Employee',
        status: 'Active',
        emailVerified: true
      });

      project = await Project.create({
        name: 'Test Project',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        budget: 10000,
        status: 'Planning',
        createdBy: user.id
      });

      // Create multiple tasks
      for (let i = 1; i <= 15; i++) {
        await Task.create({
          projectId: project.id,
          title: `Task ${i}`,
          status: i % 2 === 0 ? 'Completed' : 'In Progress',
          priority: i % 3 === 0 ? 'High' : 'Medium',
          completionPercentage: i * 5,
          actualHours: 0,
          createdBy: user.id,
          assignedTo: i % 4 === 0 ? user.id : undefined
        });
      }
    });

    it('should filter tasks by status', async () => {
      const result = await taskService.getTasks({ status: 'Completed' });

      expect(result.tasks.every(task => task.status === 'Completed')).toBe(true);
      expect(result.tasks.length).toBeGreaterThan(0);
    });

    it('should filter tasks by priority', async () => {
      const result = await taskService.getTasks({ priority: 'High' });

      expect(result.tasks.every(task => task.priority === 'High')).toBe(true);
    });

    it('should filter tasks by assignee', async () => {
      const result = await taskService.getTasks({ assignedTo: user.id });

      expect(result.tasks.every(task => task.assignedTo === user.id)).toBe(true);
    });

    it('should paginate results correctly', async () => {
      const page1 = await taskService.getTasks({}, 1, 5);
      const page2 = await taskService.getTasks({}, 2, 5);

      expect(page1.tasks).toHaveLength(5);
      expect(page2.tasks).toHaveLength(5);
      expect(page1.totalPages).toBe(3);
      expect(page1.total).toBe(15);
    });

    it('should search tasks by title', async () => {
      const result = await taskService.getTasks({ search: 'Task 1' });

      expect(result.tasks.every(task => 
        task.title.includes('Task 1')
      )).toBe(true);
    });
  });
});