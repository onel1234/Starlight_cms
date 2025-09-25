import request from 'supertest';
import bcrypt from 'bcryptjs';
import app from '../server';
import { sequelize } from '../config/database';
import { User } from '../models/User';
import { UserProfile } from '../models/UserProfile';
import { Project } from '../models/Project';
import { ProjectApproval } from '../models/ProjectApproval';
import { authService } from '../services/authService';

describe('Project Approval Workflow API', () => {
  let directorToken: string;
  let projectManagerToken: string;
  let customerToken: string;
  
  let directorUser: User;
  let projectManagerUser: User;
  let customerUser: User;
  
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

    // Generate tokens
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
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    // Clean up before each test
    await ProjectApproval.destroy({ where: {} });
    await Project.destroy({ where: {} });

    // Create test project
    testProject = await Project.create({
      name: 'High Value Project',
      description: 'A high value test project requiring approval',
      clientId: customerUser.id,
      projectManagerId: projectManagerUser.id,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      budget: 1500000, // High value requiring multiple approvals
      actualCost: 0,
      status: 'Planning',
      createdBy: directorUser.id,
    });
  });

  describe('POST /api/projects/:id/request-approval', () => {
    it('should create approval requests for high-value projects', async () => {
      const response = await request(app)
        .post(`/api/projects/${testProject.id}/request-approval`)
        .set('Authorization', `Bearer ${projectManagerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should prevent duplicate approval requests', async () => {
      // First request
      await request(app)
        .post(`/api/projects/${testProject.id}/request-approval`)
        .set('Authorization', `Bearer ${projectManagerToken}`)
        .expect(200);

      // Second request should fail
      await request(app)
        .post(`/api/projects/${testProject.id}/request-approval`)
        .set('Authorization', `Bearer ${projectManagerToken}`)
        .expect(400);
    });

    it('should reject requests for non-planning projects', async () => {
      await testProject.update({ status: 'In Progress' });

      await request(app)
        .post(`/api/projects/${testProject.id}/request-approval`)
        .set('Authorization', `Bearer ${projectManagerToken}`)
        .expect(400);
    });
  });

  describe('GET /api/projects/pending-approvals', () => {
    beforeEach(async () => {
      // Create approval request
      await request(app)
        .post(`/api/projects/${testProject.id}/request-approval`)
        .set('Authorization', `Bearer ${projectManagerToken}`);
    });

    it('should return pending approvals for directors', async () => {
      const response = await request(app)
        .get('/api/projects/pending-approvals')
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should return empty array for users with no pending approvals', async () => {
      const response = await request(app)
        .get('/api/projects/pending-approvals')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBe(0);
    });
  });

  describe('POST /api/projects/approvals/:approvalId/process', () => {
    let approvalId: number;

    beforeEach(async () => {
      // Create approval request
      const response = await request(app)
        .post(`/api/projects/${testProject.id}/request-approval`)
        .set('Authorization', `Bearer ${projectManagerToken}`);

      // Find director approval
      const approvals = response.body.data;
      const directorApproval = approvals.find((a: any) => a.approvalLevel === 'Director');
      approvalId = directorApproval.id;
    });

    it('should approve project successfully', async () => {
      const response = await request(app)
        .post(`/api/projects/approvals/${approvalId}/process`)
        .set('Authorization', `Bearer ${directorToken}`)
        .send({
          decision: 'Approved',
          comments: 'Project looks good to proceed'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.approval.status).toBe('Approved');
      expect(response.body.data.approval.comments).toBe('Project looks good to proceed');
    });

    it('should reject project successfully', async () => {
      const response = await request(app)
        .post(`/api/projects/approvals/${approvalId}/process`)
        .set('Authorization', `Bearer ${directorToken}`)
        .send({
          decision: 'Rejected',
          comments: 'Budget too high, needs revision'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.approval.status).toBe('Rejected');
      expect(response.body.data.project.status).toBe('On Hold');
    });

    it('should prevent processing by unauthorized users', async () => {
      await request(app)
        .post(`/api/projects/approvals/${approvalId}/process`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          decision: 'Approved',
          comments: 'Unauthorized approval attempt'
        })
        .expect(403);
    });
  });

  describe('GET /api/projects/:id/timeline', () => {
    it('should return project timeline data', async () => {
      const response = await request(app)
        .get(`/api/projects/${testProject.id}/timeline`)
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.project).toBeDefined();
      expect(response.body.data.tasks).toBeDefined();
      expect(response.body.data.milestones).toBeDefined();
    });
  });

  describe('PATCH /api/projects/:id/budget', () => {
    it('should update project budget successfully', async () => {
      const response = await request(app)
        .patch(`/api/projects/${testProject.id}/budget`)
        .set('Authorization', `Bearer ${projectManagerToken}`)
        .send({ actualCost: 50000 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.actualCost).toBe(50000);
    });

    it('should reject negative budget values', async () => {
      await request(app)
        .patch(`/api/projects/${testProject.id}/budget`)
        .set('Authorization', `Bearer ${projectManagerToken}`)
        .send({ actualCost: -1000 })
        .expect(400);
    });

    it('should reject budget updates by customers', async () => {
      await request(app)
        .patch(`/api/projects/${testProject.id}/budget`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ actualCost: 50000 })
        .expect(403);
    });
  });
});