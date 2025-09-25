import request from 'supertest';
import { Express } from 'express';
import { sequelize } from '../config/database';
import { User, Project, Task, TaskDependency, TaskApproval, TimeLog } from '../models';
import { authService } from '../services/authService';

// Mock the app - this would normally be imported from your app setup
const createTestApp = (): Express => {
  const express = require('express');
  const app = express();
  
  app.use(express.json());
  
  // Import routes
  const { taskRoutes } = require('../routes/taskRoutes');
  const { errorHandler } = require('../middleware/errorHandler');
  
  app.use('/api/tasks', taskRoutes);
  app.use(errorHandler);
  
  return app;
};

describe('Task API Integration Tests', () => {
  let app: Express;
  let user: User;
  let projectManager: User;
  let project: Project;
  let userToken: string;
  let pmToken: string;

  beforeAll(async () => {
    app = createTestApp();
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    // Clean up database
    await TimeLog.destroy({ where: {} });
    await TaskApproval.destroy({ where: {} });
    await TaskDependency.destroy({ where: {} });
    await Task.destroy({ where: {} });
    await Project.destroy({ where: {} });
    await User.destroy({ where: {} });

    // Create test users
    user = await User.create({
      email: 'user@example.com',
      passwordHash: await authService.hashPassword('password123'),
      role: 'Employee',
      status: 'Active',
      emailVerified: true
    });

    projectManager = await User.create({
      email: 'pm@example.com',
      passwordHash: await authService.hashPassword('password123'),
      role: 'Project Manager',
      status: 'Active',
      emailVerified: true
    });

    // Create test project
    project = await Project.create({
      name: 'Test Project',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      budget: 10000,
      status: 'Planning',
      createdBy: projectManager.id,
      projectManagerId: projectManager.id
    });

    // Generate tokens
    userToken = authService.generateToken(user.id, user.email, user.role);
    pmToken = authService.generateToken(projectManager.id, projectManager.email, projectManager.role);
  });

  describe('POST /api/tasks', () => {
    it('should create a task successfully', async () => {
      const taskData = {
        projectId: project.id,
        title: 'Test Task',
        description: 'Test task description',
        assignedTo: user.id,
        priority: 'Medium',
        estimatedHours: 8
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${pmToken}`)
        .send(taskData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(taskData.title);
      expect(response.body.data.projectId).toBe(project.id);
      expect(response.body.data.status).toBe('Not Started');
    });

    it('should require authentication', async () => {
      const taskData = {
        projectId: project.id,
        title: 'Test Task'
      };

      await request(app)
        .post('/api/tasks')
        .send(taskData)
        .expect(401);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${pmToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('required');
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
        createdBy: projectManager.id
      });

      const taskData = {
        projectId: project.id,
        title: 'Test Task',
        dependencies: [depTask.id]
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${pmToken}`)
        .send(taskData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.dependencies).toHaveLength(1);
    });
  });

  describe('GET /api/tasks', () => {
    beforeEach(async () => {
      // Create test tasks
      for (let i = 1; i <= 5; i++) {
        await Task.create({
          projectId: project.id,
          title: `Task ${i}`,
          status: i % 2 === 0 ? 'Completed' : 'In Progress',
          priority: 'Medium',
          completionPercentage: i * 20,
          actualHours: 0,
          createdBy: projectManager.id,
          assignedTo: i <= 3 ? user.id : undefined
        });
      }
    });

    it('should get all tasks with pagination', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(5);
      expect(response.body.pagination.total).toBe(5);
    });

    it('should filter tasks by status', async () => {
      const response = await request(app)
        .get('/api/tasks?status=Completed')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.data.every((task: any) => task.status === 'Completed')).toBe(true);
    });

    it('should filter tasks by assignee', async () => {
      const response = await request(app)
        .get(`/api/tasks?assignedTo=${user.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.data.every((task: any) => task.assignedTo === user.id)).toBe(true);
    });

    it('should paginate results', async () => {
      const response = await request(app)
        .get('/api/tasks?page=1&limit=2')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(2);
    });
  });

  describe('GET /api/tasks/:id', () => {
    let task: Task;

    beforeEach(async () => {
      task = await Task.create({
        projectId: project.id,
        title: 'Test Task',
        status: 'In Progress',
        priority: 'Medium',
        completionPercentage: 50,
        actualHours: 0,
        createdBy: projectManager.id,
        assignedTo: user.id
      });
    });

    it('should get task by id', async () => {
      const response = await request(app)
        .get(`/api/tasks/${task.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(task.id);
      expect(response.body.data.title).toBe(task.title);
    });

    it('should return 404 for non-existent task', async () => {
      await request(app)
        .get('/api/tasks/999')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
    });
  });

  describe('PUT /api/tasks/:id', () => {
    let task: Task;

    beforeEach(async () => {
      task = await Task.create({
        projectId: project.id,
        title: 'Test Task',
        status: 'Not Started',
        priority: 'Medium',
        completionPercentage: 0,
        actualHours: 0,
        createdBy: projectManager.id,
        assignedTo: user.id
      });
    });

    it('should update task successfully', async () => {
      const updateData = {
        title: 'Updated Task',
        status: 'In Progress',
        completionPercentage: 50
      };

      const response = await request(app)
        .put(`/api/tasks/${task.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(updateData.title);
      expect(response.body.data.status).toBe(updateData.status);
    });

    it('should prevent unauthorized updates', async () => {
      const otherUser = await User.create({
        email: 'other@example.com',
        passwordHash: await authService.hashPassword('password123'),
        role: 'Employee',
        status: 'Active',
        emailVerified: true
      });

      const otherToken = authService.generateToken(otherUser.id, otherUser.email, otherUser.role);

      await request(app)
        .put(`/api/tasks/${task.id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ title: 'Unauthorized Update' })
        .expect(400);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    let task: Task;

    beforeEach(async () => {
      task = await Task.create({
        projectId: project.id,
        title: 'Test Task',
        status: 'Not Started',
        priority: 'Medium',
        completionPercentage: 0,
        actualHours: 0,
        createdBy: projectManager.id
      });
    });

    it('should delete task successfully', async () => {
      const response = await request(app)
        .delete(`/api/tasks/${task.id}`)
        .set('Authorization', `Bearer ${pmToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify task is deleted
      const deletedTask = await Task.findByPk(task.id);
      expect(deletedTask).toBeNull();
    });

    it('should prevent deletion by non-authorized users', async () => {
      await request(app)
        .delete(`/api/tasks/${task.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(400);
    });
  });

  describe('Task Approval Workflow', () => {
    let task: Task;

    beforeEach(async () => {
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

    it('should request approval successfully', async () => {
      const response = await request(app)
        .post(`/api/tasks/${task.id}/approval-request`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ comments: 'Task completed' })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('Pending');
    });

    it('should approve task successfully', async () => {
      // First create approval request
      const approval = await TaskApproval.create({
        taskId: task.id,
        requestedBy: user.id,
        status: 'Pending',
        requestedAt: new Date()
      });

      const response = await request(app)
        .put(`/api/tasks/approvals/${approval.id}/respond`)
        .set('Authorization', `Bearer ${pmToken}`)
        .send({ 
          status: 'Approved',
          comments: 'Good work!'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('Approved');
    });
  });

  describe('Time Logging', () => {
    let task: Task;

    beforeEach(async () => {
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
      const response = await request(app)
        .post('/api/tasks/time-logs')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          taskId: task.id,
          description: 'Working on task'
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.isActive).toBe(true);
    });

    it('should stop time logging successfully', async () => {
      // First start time logging
      const timeLog = await TimeLog.create({
        taskId: task.id,
        userId: user.id,
        startTime: new Date(),
        isActive: true
      });

      const response = await request(app)
        .put(`/api/tasks/time-logs/${timeLog.id}/stop`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ description: 'Completed work session' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.isActive).toBe(false);
    });

    it('should get time logs for task', async () => {
      await TimeLog.create({
        taskId: task.id,
        userId: user.id,
        startTime: new Date(),
        isActive: true
      });

      const response = await request(app)
        .get(`/api/tasks/${task.id}/time-logs`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
    });

    it('should get user time logs', async () => {
      await TimeLog.create({
        taskId: task.id,
        userId: user.id,
        startTime: new Date(),
        isActive: true
      });

      const response = await request(app)
        .get('/api/tasks/my-time-logs')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
    });
  });

  describe('Progress Update', () => {
    let task: Task;

    beforeEach(async () => {
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

    it('should update task progress successfully', async () => {
      const response = await request(app)
        .patch(`/api/tasks/${task.id}/progress`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ completionPercentage: 75 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.completionPercentage).toBe(75);
    });

    it('should validate progress percentage range', async () => {
      await request(app)
        .patch(`/api/tasks/${task.id}/progress`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ completionPercentage: 150 })
        .expect(400);
    });
  });
});