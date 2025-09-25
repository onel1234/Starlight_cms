import request from 'supertest';
import app from '../server';
import { sequelize } from '../config/database';
import { User } from '../models/User';
import { UserProfile } from '../models/UserProfile';

describe('User Management System', () => {
  let directorToken: string;
  let employeeToken: string;
  let directorUser: any;
  let employeeUser: any;

  beforeAll(async () => {
    // Setup test database
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    // Clean up database before each test
    await UserProfile.destroy({ where: {} });
    await User.destroy({ where: {} });

    // Create test users
    const bcrypt = require('bcryptjs');
    const passwordHash = await bcrypt.hash('TestPassword123!', 12);

    // Create Director user
    directorUser = await User.create({
      email: 'director@example.com',
      passwordHash,
      role: 'Director',
      status: 'Active',
      emailVerified: true,
    });

    await UserProfile.create({
      userId: directorUser.id,
      firstName: 'Director',
      lastName: 'User',
    });

    // Create Employee user
    employeeUser = await User.create({
      email: 'employee@example.com',
      passwordHash,
      role: 'Employee',
      status: 'Active',
      emailVerified: true,
    });

    await UserProfile.create({
      userId: employeeUser.id,
      firstName: 'Employee',
      lastName: 'User',
    });

    // Get tokens
    const directorLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'director@example.com',
        password: 'TestPassword123!'
      });
    directorToken = directorLogin.body.accessToken;

    const employeeLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'employee@example.com',
        password: 'TestPassword123!'
      });
    employeeToken = employeeLogin.body.accessToken;
  });

  describe('GET /api/users', () => {
    it('should allow Director to get all users', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(200);

      expect(response.body.users).toHaveLength(2);
      expect(response.body.pagination).toBeDefined();
    });

    it('should allow Project Manager to get all users', async () => {
      // Create Project Manager
      const bcrypt = require('bcryptjs');
      const passwordHash = await bcrypt.hash('TestPassword123!', 12);

      const pmUser = await User.create({
        email: 'pm@example.com',
        passwordHash,
        role: 'Project Manager',
        status: 'Active',
        emailVerified: true,
      });

      const pmLogin = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'pm@example.com',
          password: 'TestPassword123!'
        });

      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${pmLogin.body.accessToken}`)
        .expect(200);

      expect(response.body.users).toHaveLength(3);
    });

    it('should reject Employee access to user list', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${employeeToken}`)
        .expect(403);

      expect(response.body.error).toContain('Insufficient role level');
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/users?page=1&limit=1')
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(200);

      expect(response.body.users).toHaveLength(1);
      expect(response.body.pagination.totalUsers).toBe(2);
      expect(response.body.pagination.totalPages).toBe(2);
    });

    it('should support role filtering', async () => {
      const response = await request(app)
        .get('/api/users?role=Director')
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(200);

      expect(response.body.users).toHaveLength(1);
      expect(response.body.users[0].role).toBe('Director');
    });

    it('should support search functionality', async () => {
      const response = await request(app)
        .get('/api/users?search=Director')
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(200);

      expect(response.body.users).toHaveLength(1);
      expect(response.body.users[0].profile.firstName).toBe('Director');
    });
  });

  describe('GET /api/users/:id', () => {
    it('should allow Director to get any user', async () => {
      const response = await request(app)
        .get(`/api/users/${employeeUser.id}`)
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(200);

      expect(response.body.user.email).toBe('employee@example.com');
    });

    it('should allow users to get their own profile', async () => {
      const response = await request(app)
        .get(`/api/users/${employeeUser.id}`)
        .set('Authorization', `Bearer ${employeeToken}`)
        .expect(200);

      expect(response.body.user.email).toBe('employee@example.com');
    });

    it('should reject Employee access to other user profiles', async () => {
      const response = await request(app)
        .get(`/api/users/${directorUser.id}`)
        .set('Authorization', `Bearer ${employeeToken}`)
        .expect(403);

      expect(response.body.error).toContain('Cannot access this user profile');
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get('/api/users/99999')
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(404);

      expect(response.body.error).toBe('User not found');
    });

    it('should return 400 for invalid user ID', async () => {
      const response = await request(app)
        .get('/api/users/invalid')
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(400);

      expect(response.body.error).toBe('Invalid user ID');
    });
  });

  describe('POST /api/users', () => {
    const newUserData = {
      email: 'newuser@example.com',
      role: 'Employee',
      firstName: 'New',
      lastName: 'User',
      phone: '+1234567890',
      companyName: 'Test Company',
      position: 'Developer'
    };

    it('should allow Director to create new user', async () => {
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${directorToken}`)
        .send(newUserData)
        .expect(201);

      expect(response.body.message).toBe('User created successfully');
      expect(response.body.user.email).toBe(newUserData.email);
      expect(response.body.tempPassword).toBeDefined();
    });

    it('should reject Employee creating users', async () => {
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send(newUserData)
        .expect(403);

      expect(response.body.error).toContain('Insufficient permissions');
    });

    it('should reject duplicate email', async () => {
      const duplicateData = { ...newUserData, email: 'director@example.com' };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${directorToken}`)
        .send(duplicateData)
        .expect(409);

      expect(response.body.error).toContain('already exists');
    });

    it('should validate required fields', async () => {
      const invalidData = { ...newUserData };
      delete invalidData.firstName;

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${directorToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toBe('Validation Error');
    });
  });

  describe('PUT /api/users/:id', () => {
    const updateData = {
      firstName: 'Updated',
      lastName: 'Name',
      phone: '+9876543210'
    };

    it('should allow Director to update any user', async () => {
      const response = await request(app)
        .put(`/api/users/${employeeUser.id}`)
        .set('Authorization', `Bearer ${directorToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.message).toBe('User updated successfully');
      expect(response.body.user.profile.firstName).toBe('Updated');
    });

    it('should allow users to update their own profile', async () => {
      const response = await request(app)
        .put(`/api/users/${employeeUser.id}`)
        .set('Authorization', `Bearer ${employeeToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.user.profile.firstName).toBe('Updated');
    });

    it('should reject Employee updating other users', async () => {
      const response = await request(app)
        .put(`/api/users/${directorUser.id}`)
        .set('Authorization', `Bearer ${employeeToken}`)
        .send(updateData)
        .expect(403);

      expect(response.body.error).toContain('Cannot update this user');
    });

    it('should only allow Director to change roles', async () => {
      const roleUpdate = { role: 'Project Manager' };

      // Employee trying to change role
      await request(app)
        .put(`/api/users/${employeeUser.id}`)
        .set('Authorization', `Bearer ${employeeToken}`)
        .send(roleUpdate)
        .expect(200); // Should succeed but role shouldn't change

      // Verify role didn't change
      const user = await User.findByPk(employeeUser.id);
      expect(user!.role).toBe('Employee');

      // Director changing role
      const response = await request(app)
        .put(`/api/users/${employeeUser.id}`)
        .set('Authorization', `Bearer ${directorToken}`)
        .send(roleUpdate)
        .expect(200);

      expect(response.body.user.role).toBe('Project Manager');
    });
  });

  describe('PUT /api/users/profile/me', () => {
    const profileUpdate = {
      firstName: 'Updated',
      lastName: 'Profile',
      phone: '+1111111111'
    };

    it('should allow authenticated user to update own profile', async () => {
      const response = await request(app)
        .put('/api/users/profile/me')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send(profileUpdate)
        .expect(200);

      expect(response.body.message).toBe('Profile updated successfully');
      expect(response.body.user.profile.firstName).toBe('Updated');
    });

    it('should reject unauthenticated requests', async () => {
      const response = await request(app)
        .put('/api/users/profile/me')
        .send(profileUpdate)
        .expect(401);

      expect(response.body.error).toContain('Access token required');
    });

    it('should validate profile data', async () => {
      const invalidData = { firstName: 'A' }; // Too short

      const response = await request(app)
        .put('/api/users/profile/me')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toBe('Validation Error');
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should allow Director to deactivate users', async () => {
      const response = await request(app)
        .delete(`/api/users/${employeeUser.id}`)
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(200);

      expect(response.body.message).toBe('User deactivated successfully');

      // Verify user is deactivated
      const user = await User.findByPk(employeeUser.id);
      expect(user!.status).toBe('Inactive');
    });

    it('should reject Employee deactivating users', async () => {
      const response = await request(app)
        .delete(`/api/users/${directorUser.id}`)
        .set('Authorization', `Bearer ${employeeToken}`)
        .expect(403);

      expect(response.body.error).toContain('Insufficient permissions');
    });

    it('should prevent self-deactivation', async () => {
      const response = await request(app)
        .delete(`/api/users/${directorUser.id}`)
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(400);

      expect(response.body.error).toContain('Cannot deactivate your own account');
    });
  });

  describe('POST /api/users/:id/reactivate', () => {
    beforeEach(async () => {
      // Deactivate employee user
      await User.update(
        { status: 'Inactive' },
        { where: { id: employeeUser.id } }
      );
    });

    it('should allow Director to reactivate users', async () => {
      const response = await request(app)
        .post(`/api/users/${employeeUser.id}/reactivate`)
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(200);

      expect(response.body.message).toBe('User reactivated successfully');

      // Verify user is reactivated
      const user = await User.findByPk(employeeUser.id);
      expect(user!.status).toBe('Active');
    });

    it('should reject Employee reactivating users', async () => {
      const response = await request(app)
        .post(`/api/users/${employeeUser.id}/reactivate`)
        .set('Authorization', `Bearer ${employeeToken}`)
        .expect(403);

      expect(response.body.error).toContain('Insufficient permissions');
    });
  });

  describe('GET /api/users/stats/overview', () => {
    it('should allow Director to get user statistics', async () => {
      const response = await request(app)
        .get('/api/users/stats/overview')
        .set('Authorization', `Bearer ${directorToken}`)
        .expect(200);

      expect(response.body.totalUsers).toBe(2);
      expect(response.body.activeUsers).toBe(2);
      expect(response.body.usersByRole).toBeDefined();
      expect(response.body.usersByRole.Director).toBe(1);
      expect(response.body.usersByRole.Employee).toBe(1);
    });

    it('should reject Employee access to statistics', async () => {
      const response = await request(app)
        .get('/api/users/stats/overview')
        .set('Authorization', `Bearer ${employeeToken}`)
        .expect(403);

      expect(response.body.error).toContain('Insufficient permissions');
    });
  });
});