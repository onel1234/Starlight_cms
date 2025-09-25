import request from 'supertest';
import app from '../server';

describe('Authentication Integration', () => {
  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('OK');
      expect(response.body.timestamp).toBeDefined();
    });
  });

  describe('Auth Endpoints', () => {
    it('should have auth routes available', async () => {
      // Test that auth endpoints exist (even if they return errors due to missing data)
      await request(app)
        .post('/api/auth/login')
        .send({})
        .expect(400); // Should return validation error, not 404

      await request(app)
        .post('/api/auth/register')
        .send({})
        .expect(400); // Should return validation error, not 404
    });

    it('should validate login request format', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid-email',
          password: 'test'
        })
        .expect(400);

      expect(response.body.error).toBe('Validation Error');
    });

    it('should validate registration request format', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'weak'
        })
        .expect(400);

      expect(response.body.error).toBe('Validation Error');
    });
  });

  describe('User Endpoints', () => {
    it('should require authentication for user endpoints', async () => {
      await request(app)
        .get('/api/users')
        .expect(401);

      await request(app)
        .get('/api/auth/me')
        .expect(401);
    });
  });
});