// tests/user.test.ts - Fixed User Tests
import request from 'supertest';
import app from '../app';
import './setup';

describe('User Authentication', () => {
  const testUser = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'TestPassword123'
  };

  test('should register a new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.user.email).toBe(testUser.email);
  });

  test('should not register user with invalid email', async () => {
    const invalidUser = { ...testUser, email: 'invalid-email' };
    
    const response = await request(app)
      .post('/api/auth/register')
      .send(invalidUser);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  test('should login with valid credentials', async () => {
    // First register the user
    await request(app)
      .post('/api/auth/register')
      .send(testUser);

    // Then login
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.token).toBeDefined();
  });
});
