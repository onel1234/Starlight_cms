import request from 'supertest';
import bcrypt from 'bcryptjs';
import app from '../server';
import { sequelize } from '../config/database';
import { User } from '../models/User';
import { UserProfile } from '../models/UserProfile';
import { Project } from '../models/Project';
import { Task } from '../models/Task';
import { authService } from '../services/authService';

describe('Project Management API', () => {
  let directorToken: string;
  let projectManagerToken: string;
  let customerToken: string;
  let employeeToken: string;
  
  let directorUser: User;
  let projectManagerUser: User;
  let customerUser: User;
  let employeeUser: User;
  
  let testProject: Project;

  beforeAll(async () => {
    // Sync database
    await sequelize.sync({ force: true });

    // Hash password for test users
    const hashedPassword = await bcrypt.hash('password123', 12);

    // Create test users
    directorUser = await User.create({
      email: 'director@test.com',
      passwordHash: hashedPassword,
      role: 'Director',
      status: 'Active',
      emailVerified: true,
    });

    await UserProfile.create({
      userId: directorUser.id,
      firstName: 'John',
      lastName: 'Director',
    });

    projectManagerUser = await User.create({
      email: 'pm@test.com',
      passwordHash: hashedPassword,
      role: 'Project Manager',
      status: 'Active',
      emailVerified: true,
    });

    await UserProfile.create({
      userId: projectManagerUser.id,
      firstName: 'Jane',
      lastName: 'Manager',
    });

    customerUser = await User.create({
      email: 'customer@test.com',
      passwordHash: hashedPassword,
      role: 'Customer',
      status: 'Active',
      emailVerified: true,
    });

    await UserProfile.create({
      userId: customerUser.id,
      firstName: 'Bob',
      lastName: 'Customer',
    });

    employeeUser = await User.create({
      email: 'employee@test.com',
      passwordHash: hashedPassword,
      role: 'Employee',
      status: 'Active',
      emailVerified: true,
    });

    await UserProfile.create({
      userId: employeeUser.id,
      firstName: 'Alice',
      lastName: 'Employee',
    });

    // Generate tokens by logging in
    const directorLogin = await authService.login({
      email: 'director@test.com',
      password: 'password123'
    });
    directorToken = directorLogin.accessToken;

    const pmLogin = await authService.login({
      email: 'pm@test.com', 
      password: 'password123'
    });
    projectManagerToken = pmLogin.accessToken;

    const customerLogin = await authService.login({
      email: 'customer@test.com',
      password: 'password123'
    });
    customerToken = customerLogin.accessToken;

    const employeeLogin = await authService.login({
      email: 'employee@test.com',
      password: 'password123'
    });
    employeeToken = employeeLogin.accessToken;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    // Clean up projects and tasks before each test
    await Task.destroy({ where: {} });
    await Project.destroy({ where: {} });
  });

  describe('POST /api/projects', () => {
    const validProjectData = {
      name: 'Test Project',
      description: 'A test project',
      clientId: null as number | null,
      projectManagerId: null as number | null,
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      budget: 100000,
      location: 'Test Location',
      projectType: 'Construction',
    };

    beforeEach(() => {
      validProjectData.clientId = customerUser.id;
      validProjectData.projectManagerId = projectManagerUser.id;
    });

    it('should create project successfully with valid data', async () => {
      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${directorToken}`)
        .send(validProjectData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(validProjectData.name);
      expect(response.body.data.status).toBe('Planning');
    });

    it('should allow project managers to create projects', async () => {
      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${projectManagerToken}`)
        .send(validProjectData)
        .expect(201);

      expect(response.body.success).toBe(true);
    });

    it('should reject creation by employees', async () => {
      await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send(validProjectData)
        .expect(403);
    });

    it('should reject creation by customers', async () => {
      await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(validProjectData)
        .expect(403);
    });

    it('should validate required fields', async () => {
      const invalidData = { ...validProjectData };
      delete (invalidData as any).name;

      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${directorToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should validate date range', async () => {
      const invalidData = {
        ...validProjectData,
        startDate: '2024-12-31',
        endDate: '2024-01-01',
      };

      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${directorToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should validate client role', async () => {
      const invalidData = {
        ...validProjectData,
        clientId: directorUser.id, // Director cannot be a client
      };

      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${directorToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/projects', () => {
    beforeEach(async () => {
      // Create test projects
      testProject = await Project.create({
        name: 'Test Project 1',
        description: 'First test project',
        clientId: customerUser.id,
        projectManagerId: projectManagerUser.id,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        budget: 100000,
        actualCost: 0,
        status: 'Planning',
        createdBy: directorUser.id,
      });

      await Project.create({
        name: 'Test Project 2',
        description: 'Second test project',
        clientId: customerUser.id,
        projectManagerId: projectManagerUser.id,
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-11-30'),
        budget: 150000,
        actualCost: 0,
        status: 'In Progress',
        createdBy: directorUser.id,
      });
    });

    it('should return all projects for directors', async () => {
      const response = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination.total).toBe(2);
    });

    it('should filter projects by status', async () => {
      const response = await request(app)
        .get('/api/projects?status=Planning')
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].status).toBe('Planning');
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/projects?page=1&limit=1')
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(1);
      expect(response.body.pagination.totalPages).toBe(2);
    });

    it('should filter projects for customers', async () => {
      const response = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      // All projects should belong to this customer
      response.body.data.forEach((project: any) => {
        expect(project.clientId).toBe(customerUser.id);
      });
    });

    it('should filter projects for project managers', async () => {
      const response = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${projectManagerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      // All projects should be managed by this PM
      response.body.data.forEach((project: any) => {
        expect(project.projectManagerId).toBe(projectManagerUser.id);
      });
    });

    it('should support search functionality', async () => {
      const response = await request(app)
        .get('/api/projects?search=First')
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].description).toContain('First');
    });
  });

  describe('GET /api/projects/:id', () => {
    beforeEach(async () => {
      testProject = await Project.create({
        name: 'Test Project',
        description: 'A test project',
        clientId: customerUser.id,
        projectManagerId: projectManagerUser.id,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        budget: 100000,
        actualCost: 0,
        status: 'Planning',
        createdBy: directorUser.id,
      });
    });

    it('should return project details for authorized users', async () => {
      const response = await request(app)
        .get(`/api/projects/${testProject.id}`)
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testProject.id);
      expect(response.body.data.name).toBe(testProject.name);
    });

    it('should allow customers to view their own projects', async () => {
      const response = await request(app)
        .get(`/api/projects/${testProject.id}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testProject.id);
    });

    it('should allow project managers to view their managed projects', async () => {
      const response = await request(app)
        .get(`/api/projects/${testProject.id}`)
        .set('Authorization', `Bearer ${projectManagerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testProject.id);
    });

    it('should return 404 for non-existent project', async () => {
      await request(app)
        .get('/api/projects/99999')
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(404);
    });

    it('should return 400 for invalid project ID', async () => {
      await request(app)
        .get('/api/projects/invalid')
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(400);
    });
  });

  describe('PUT /api/projects/:id', () => {
    beforeEach(async () => {
      testProject = await Project.create({
        name: 'Test Project',
        description: 'A test project',
        clientId: customerUser.id,
        projectManagerId: projectManagerUser.id,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        budget: 100000,
        actualCost: 0,
        status: 'Planning',
        createdBy: directorUser.id,
      });
    });

    it('should update project successfully', async () => {
      const updateData = {
        name: 'Updated Project Name',
        budget: 150000,
      };

      const response = await request(app)
        .put(`/api/projects/${testProject.id}`)
        .set('Authorization', `Bearer ${directorToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.budget).toBe(updateData.budget);
    });

    it('should allow project managers to update their projects', async () => {
      const updateData = { description: 'Updated description' };

      const response = await request(app)
        .put(`/api/projects/${testProject.id}`)
        .set('Authorization', `Bearer ${projectManagerToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.description).toBe(updateData.description);
    });

    it('should reject updates by customers', async () => {
      const updateData = { name: 'Updated Name' };

      await request(app)
        .put(`/api/projects/${testProject.id}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send(updateData)
        .expect(403);
    });

    it('should validate status transitions', async () => {
      const updateData = { status: 'Closed' };

      const response = await request(app)
        .put(`/api/projects/${testProject.id}`)
        .set('Authorization', `Bearer ${directorToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/projects/:id', () => {
    beforeEach(async () => {
      testProject = await Project.create({
        name: 'Test Project',
        description: 'A test project',
        clientId: customerUser.id,
        projectManagerId: projectManagerUser.id,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        budget: 100000,
        actualCost: 0,
        status: 'Planning',
        createdBy: directorUser.id,
      });
    });

    it('should allow directors to delete projects', async () => {
      const response = await request(app)
        .delete(`/api/projects/${testProject.id}`)
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify project is deleted
      const project = await Project.findByPk(testProject.id);
      expect(project).toBeNull();
    });

    it('should reject deletion by project managers', async () => {
      await request(app)
        .delete(`/api/projects/${testProject.id}`)
        .set('Authorization', `Bearer ${projectManagerToken}`)
        .expect(403);
    });

    it('should reject deletion by customers', async () => {
      await request(app)
        .delete(`/api/projects/${testProject.id}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(403);
    });

    it('should prevent deletion of projects with tasks', async () => {
      // Create a task for the project
      await Task.create({
        projectId: testProject.id,
        assignedTo: employeeUser.id,
        title: 'Test Task',
        status: 'Not Started',
        priority: 'Medium',
        completionPercentage: 0,
        actualHours: 0,
        createdBy: directorUser.id,
      });

      const response = await request(app)
        .delete(`/api/projects/${testProject.id}`)
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/projects/:id/approve', () => {
    beforeEach(async () => {
      testProject = await Project.create({
        name: 'Test Project',
        description: 'A test project',
        clientId: customerUser.id,
        projectManagerId: projectManagerUser.id,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        budget: 100000,
        actualCost: 0,
        status: 'Planning',
        createdBy: directorUser.id,
      });
    });

    it('should allow directors to approve projects', async () => {
      const response = await request(app)
        .patch(`/api/projects/${testProject.id}/approve`)
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('In Progress');
    });

    it('should reject approval by non-directors', async () => {
      await request(app)
        .patch(`/api/projects/${testProject.id}/approve`)
        .set('Authorization', `Bearer ${projectManagerToken}`)
        .expect(403);
    });

    it('should only approve projects in Planning status', async () => {
      // Update project to In Progress
      await testProject.update({ status: 'In Progress' });

      const response = await request(app)
        .patch(`/api/projects/${testProject.id}/approve`)
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/projects/:id/stats', () => {
    beforeEach(async () => {
      testProject = await Project.create({
        name: 'Test Project',
        description: 'A test project',
        clientId: customerUser.id,
        projectManagerId: projectManagerUser.id,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        budget: 100000,
        actualCost: 25000,
        status: 'In Progress',
        createdBy: directorUser.id,
      });

      // Create some tasks
      await Task.create({
        projectId: testProject.id,
        assignedTo: employeeUser.id,
        title: 'Completed Task',
        status: 'Completed',
        priority: 'High',
        completionPercentage: 100,
        actualHours: 10,
        createdBy: directorUser.id,
      });

      await Task.create({
        projectId: testProject.id,
        assignedTo: employeeUser.id,
        title: 'In Progress Task',
        status: 'In Progress',
        priority: 'Medium',
        completionPercentage: 50,
        actualHours: 5,
        createdBy: directorUser.id,
      });
    });

    it('should return project statistics', async () => {
      const response = await request(app)
        .get(`/api/projects/${testProject.id}/stats`)
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.project.budgetUtilization).toBe(25);
      expect(response.body.data.project.progress).toBe(50); // 1 out of 2 tasks completed
      expect(response.body.data.tasks.total).toBe(2);
      expect(response.body.data.tasks.byStatus.Completed).toBe(1);
      expect(response.body.data.tasks.byStatus['In Progress']).toBe(1);
    });
  });

  describe('Authentication and Authorization', () => {
    it('should require authentication', async () => {
      await request(app)
        .get('/api/projects')
        .expect(401);
    });

    it('should reject invalid tokens', async () => {
      await request(app)
        .get('/api/projects')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });
});