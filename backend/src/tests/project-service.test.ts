import bcrypt from 'bcryptjs';
import { sequelize } from '../config/database';
import { User } from '../models/User';
import { UserProfile } from '../models/UserProfile';
import { Project } from '../models/Project';
import { Task } from '../models/Task';
import { ProjectApproval } from '../models/ProjectApproval';
import { projectService } from '../services/projectService';
import { ValidationError, NotFoundError, AuthorizationError } from '../middleware/errorHandler';

describe('ProjectService', () => {
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
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    // Clean up before each test
    await ProjectApproval.destroy({ where: {} });
    await Task.destroy({ where: {} });
    await Project.destroy({ where: {} });
  });

  describe('createProject', () => {
    const validProjectData = {
      name: 'Test Project',
      description: 'A test project',
      clientId: 0,
      projectManagerId: 0,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      budget: 100000,
      location: 'Test Location',
      projectType: 'Construction',
      createdBy: 0,
    };

    beforeEach(() => {
      validProjectData.clientId = customerUser.id;
      validProjectData.projectManagerId = projectManagerUser.id;
      validProjectData.createdBy = directorUser.id;
    });

    it('should create project with valid data', async () => {
      const project = await projectService.createProject(validProjectData);

      expect(project.name).toBe(validProjectData.name);
      expect(project.status).toBe('Planning');
      expect(project.budget).toBe(validProjectData.budget);
    });

    it('should validate date range', async () => {
      const invalidData = {
        ...validProjectData,
        startDate: new Date('2024-12-31'),
        endDate: new Date('2024-01-01'),
      };

      await expect(projectService.createProject(invalidData))
        .rejects.toThrow(ValidationError);
    });

    it('should validate client role', async () => {
      const invalidData = {
        ...validProjectData,
        clientId: directorUser.id, // Director cannot be a client
      };

      await expect(projectService.createProject(invalidData))
        .rejects.toThrow(ValidationError);
    });

    it('should validate project manager role', async () => {
      const invalidData = {
        ...validProjectData,
        projectManagerId: customerUser.id, // Customer cannot be a PM
      };

      await expect(projectService.createProject(invalidData))
        .rejects.toThrow(ValidationError);
    });
  });

  describe('getProjects', () => {
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

    it('should return projects with pagination', async () => {
      const result = await projectService.getProjects(
        {},
        { page: 1, limit: 10 },
        'Director',
        directorUser.id
      );

      expect(result.projects).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
      expect(result.pagination.page).toBe(1);
    });

    it('should filter by status', async () => {
      const result = await projectService.getProjects(
        { status: 'Planning' },
        { page: 1, limit: 10 },
        'Director',
        directorUser.id
      );

      expect(result.projects).toHaveLength(1);
      expect(result.projects[0].status).toBe('Planning');
    });

    it('should filter projects for customers', async () => {
      const result = await projectService.getProjects(
        {},
        { page: 1, limit: 10 },
        'Customer',
        customerUser.id
      );

      expect(result.projects).toHaveLength(1);
      expect(result.projects[0].clientId).toBe(customerUser.id);
    });

    it('should support search functionality', async () => {
      const result = await projectService.getProjects(
        { search: 'Test' },
        { page: 1, limit: 10 },
        'Director',
        directorUser.id
      );

      expect(result.projects).toHaveLength(1);
    });
  });

  describe('updateProject', () => {
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

      const updatedProject = await projectService.updateProject(
        testProject.id,
        updateData,
        'Director',
        directorUser.id
      );

      expect(updatedProject.name).toBe(updateData.name);
      expect(updatedProject.budget).toBe(updateData.budget);
    });

    it('should validate status transitions', async () => {
      await expect(projectService.updateProject(
        testProject.id,
        { status: 'Closed' },
        'Director',
        directorUser.id
      )).rejects.toThrow(ValidationError);
    });

    it('should prevent customers from updating projects', async () => {
      await expect(projectService.updateProject(
        testProject.id,
        { name: 'Updated Name' },
        'Customer',
        customerUser.id
      )).rejects.toThrow(AuthorizationError);
    });
  });

  describe('Multi-level Approval Workflow', () => {
    beforeEach(async () => {
      testProject = await Project.create({
        name: 'High Value Project',
        description: 'A high value test project',
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

    it('should create approval requests based on budget', async () => {
      const approvals = await projectService.requestProjectApproval(
        testProject.id,
        projectManagerUser.id,
        'Project Manager'
      );

      expect(approvals.length).toBeGreaterThan(0);
      expect(approvals.some(a => a.approvalLevel === 'Director')).toBe(true);
    });

    it('should prevent duplicate approval requests', async () => {
      await projectService.requestProjectApproval(
        testProject.id,
        projectManagerUser.id,
        'Project Manager'
      );

      await expect(projectService.requestProjectApproval(
        testProject.id,
        projectManagerUser.id,
        'Project Manager'
      )).rejects.toThrow(ValidationError);
    });

    it('should process approval decisions', async () => {
      const approvals = await projectService.requestProjectApproval(
        testProject.id,
        projectManagerUser.id,
        'Project Manager'
      );

      const directorApproval = approvals.find(a => a.approvalLevel === 'Director');
      expect(directorApproval).toBeDefined();

      const result = await projectService.processProjectApproval(
        directorApproval!.id,
        directorUser.id,
        'Approved',
        'Looks good to proceed'
      );

      expect(result.approval.status).toBe('Approved');
      expect(result.approval.comments).toBe('Looks good to proceed');
    });

    it('should reject all pending approvals when one is rejected', async () => {
      const approvals = await projectService.requestProjectApproval(
        testProject.id,
        projectManagerUser.id,
        'Project Manager'
      );

      const directorApproval = approvals.find(a => a.approvalLevel === 'Director');
      
      await projectService.processProjectApproval(
        directorApproval!.id,
        directorUser.id,
        'Rejected',
        'Budget too high'
      );

      const allApprovals = await projectService.getProjectApprovals(testProject.id);
      const rejectedCount = allApprovals.filter(a => a.status === 'Rejected').length;
      
      expect(rejectedCount).toBe(allApprovals.length);
    });

    it('should get pending approvals for user', async () => {
      await projectService.requestProjectApproval(
        testProject.id,
        projectManagerUser.id,
        'Project Manager'
      );

      const pendingApprovals = await projectService.getPendingApprovals(directorUser.id);
      
      expect(pendingApprovals.length).toBeGreaterThan(0);
      expect(pendingApprovals[0].status).toBe('Pending');
    });
  });

  describe('getProjectStats', () => {
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

      // Create test tasks
      await Task.create({
        projectId: testProject.id,
        assignedTo: projectManagerUser.id,
        title: 'Completed Task',
        status: 'Completed',
        priority: 'High',
        completionPercentage: 100,
        actualHours: 10,
        createdBy: directorUser.id,
      });

      await Task.create({
        projectId: testProject.id,
        assignedTo: projectManagerUser.id,
        title: 'In Progress Task',
        status: 'In Progress',
        priority: 'Medium',
        completionPercentage: 50,
        actualHours: 5,
        createdBy: directorUser.id,
      });
    });

    it('should return project statistics', async () => {
      const stats = await projectService.getProjectStats(testProject.id);

      expect(stats.project.budgetUtilization).toBe(25);
      expect(stats.project.progress).toBe(50); // 1 out of 2 tasks completed
      expect(stats.tasks.total).toBe(2);
      expect(stats.tasks.byStatus.Completed).toBe(1);
      expect(stats.tasks.byStatus['In Progress']).toBe(1);
    });
  });

  describe('deleteProject', () => {
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
      await projectService.deleteProject(
        testProject.id,
        'Director',
        directorUser.id
      );

      const project = await Project.findByPk(testProject.id);
      expect(project).toBeNull();
    });

    it('should prevent deletion by non-directors', async () => {
      await expect(projectService.deleteProject(
        testProject.id,
        'Project Manager',
        projectManagerUser.id
      )).rejects.toThrow(AuthorizationError);
    });

    it('should prevent deletion of projects with tasks', async () => {
      await Task.create({
        projectId: testProject.id,
        assignedTo: projectManagerUser.id,
        title: 'Test Task',
        status: 'Not Started',
        priority: 'Medium',
        completionPercentage: 0,
        actualHours: 0,
        createdBy: directorUser.id,
      });

      await expect(projectService.deleteProject(
        testProject.id,
        'Director',
        directorUser.id
      )).rejects.toThrow(ValidationError);
    });
  });
});