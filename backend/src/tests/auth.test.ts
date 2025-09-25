import request from 'supertest';
import app from '../server';
import { sequelize } from '../config/database';
import { User } from '../models/User';
import { UserProfile } from '../models/UserProfile';

describe('Authentication System', () => {
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
  });

  describe('POST /api/auth/register', () => {
    const validRegistrationData = {
      email: 'test@example.com',
      password: 'TestPassword123!',
      role: 'Employee',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1234567890',
      companyName: 'Test Company',
      position: 'Developer'
    };

    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(validRegistrationData)
        .expect(201);

      expect(response.body.message).toContain('Registration successful');
      expect(response.body.user.email).toBe(validRegistrationData.email);
      expect(response.body.user.role).toBe(validRegistrationData.role);
      expect(response.body.user.emailVerified).toBe(false);
      expect(response.body.user.status).toBe('Pending');
    });

    it('should reject registration with invalid email', async () => {
      const invalidData = { ...validRegistrationData, email: 'invalid-email' };
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toBe('Validation Error');
    });

    it('should reject registration with weak password', async () => {
      const invalidData = { ...validRegistrationData, password: 'weak' };
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toBe('Validation Error');
    });

    it('should reject registration with duplicate email', async () => {
      // First registration
      await request(app)
        .post('/api/auth/register')
        .send(validRegistrationData)
        .expect(201);

      // Second registration with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send(validRegistrationData)
        .expect(409);

      expect(response.body.error).toContain('already exists');
    });

    it('should reject registration with invalid role', async () => {
      const invalidData = { ...validRegistrationData, role: 'InvalidRole' };
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toBe('Validation Error');
    });
  });

  describe('POST /api/auth/login', () => {
    let testUser: any;

    beforeEach(async () => {
      // Create a verified user for login tests
      const bcrypt = require('bcryptjs');
      const passwordHash = await bcrypt.hash('TestPassword123!', 12);
      
      testUser = await User.create({
        email: 'test@example.com',
        passwordHash,
        role: 'Employee',
        status: 'Active',
        emailVerified: true,
      });

      await UserProfile.create({
        userId: testUser.id,
        firstName: 'John',
        lastName: 'Doe',
      });
    });

    it('should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'TestPassword123!'
        })
        .expect(200);

      expect(response.body.message).toBe('Login successful');
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.refreshToken).toBeDefined();
      expect(response.body.user.email).toBe('test@example.com');
    });

    it('should reject login with invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'TestPassword123!'
        })
        .expect(401);

      expect(response.body.error).toContain('Invalid credentials');
    });

    it('should reject login with invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword123!'
        })
        .expect(401);

      expect(response.body.error).toContain('Invalid credentials');
    });

    it('should reject login for unverified user', async () => {
      // Create unverified user
      const bcrypt = require('bcryptjs');
      const passwordHash = await bcrypt.hash('TestPassword123!', 12);
      
      await User.create({
        email: 'unverified@example.com',
        passwordHash,
        role: 'Employee',
        status: 'Pending',
        emailVerified: false,
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'unverified@example.com',
          password: 'TestPassword123!'
        })
        .expect(401);

      expect(response.body.error).toContain('verify your email');
    });

    it('should reject login for inactive user', async () => {
      // Update user to inactive
      await User.update(
        { status: 'Inactive' },
        { where: { id: testUser.id } }
      );

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'TestPassword123!'
        })
        .expect(401);

      expect(response.body.error).toContain('not active');
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    beforeEach(async () => {
      const bcrypt = require('bcryptjs');
      const passwordHash = await bcrypt.hash('TestPassword123!', 12);
      
      await User.create({
        email: 'test@example.com',
        passwordHash,
        role: 'Employee',
        status: 'Active',
        emailVerified: true,
      });
    });

    it('should accept forgot password request for existing user', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'test@example.com' })
        .expect(200);

      expect(response.body.message).toContain('password reset link');
    });

    it('should not reveal if email does not exist', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' })
        .expect(200);

      expect(response.body.message).toContain('password reset link');
    });

    it('should reject invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'invalid-email' })
        .expect(400);

      expect(response.body.error).toBe('Validation Error');
    });
  });

  describe('GET /api/auth/me', () => {
    let testUser: any;
    let accessToken: string;

    beforeEach(async () => {
      // Create and login user to get token
      const bcrypt = require('bcryptjs');
      const passwordHash = await bcrypt.hash('TestPassword123!', 12);
      
      testUser = await User.create({
        email: 'test@example.com',
        passwordHash,
        role: 'Employee',
        status: 'Active',
        emailVerified: true,
      });

      await UserProfile.create({
        userId: testUser.id,
        firstName: 'John',
        lastName: 'Doe',
      });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'TestPassword123!'
        });

      accessToken = loginResponse.body.accessToken;
    });

    it('should return current user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.user.profile.firstName).toBe('John');
    });

    it('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.error).toContain('Access token required');
    });

    it('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.error).toContain('Invalid token');
    });
  });

  describe('POST /api/auth/validate-token', () => {
    let accessToken: string;

    beforeEach(async () => {
      // Create and login user to get token
      const bcrypt = require('bcryptjs');
      const passwordHash = await bcrypt.hash('TestPassword123!', 12);
      
      const testUser = await User.create({
        email: 'test@example.com',
        passwordHash,
        role: 'Employee',
        status: 'Active',
        emailVerified: true,
      });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'TestPassword123!'
        });

      accessToken = loginResponse.body.accessToken;
    });

    it('should validate valid token', async () => {
      const response = await request(app)
        .post('/api/auth/validate-token')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.valid).toBe(true);
      expect(response.body.user.email).toBe('test@example.com');
    });

    it('should reject invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/validate-token')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.valid).toBe(false);
    });
  });

  describe('Rate Limiting', () => {
    it('should apply rate limiting to login endpoint', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'TestPassword123!'
      };

      // Make multiple requests quickly
      const requests = Array(5).fill(null).map(() =>
        request(app).post('/api/auth/login').send(loginData)
      );

      const responses = await Promise.all(requests);
      
      // At least one should be rate limited
      const rateLimitedResponses = responses.filter(res => res.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });
});