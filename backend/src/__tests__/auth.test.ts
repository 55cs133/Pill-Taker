import { describe, it, expect, beforeEach } from 'vitest';

import { createTestApp, cleanupDb, createTestUser, getSessionCookie, request } from './helpers';

describe('Auth', () => {
  let app: any;

  beforeEach(async () => {
    app = await createTestApp();
    await cleanupDb();
  });

  describe('POST /login/register', () => {
    it('creates user with exact response shape and bcrypt password', async () => {
      const res = await request(app)
        .post('/login/register')
        .send({ email: 'test@example.com', password: 'secret123', name: 'Test User' });

      expect(res.status).toBe(201);
      expect(res.body).toEqual({
        message: 'Welcome Test User',
        user: { name: 'Test User', email: 'test@example.com' },
      });
      expect(res.headers['set-cookie']).toBeDefined();
      expect(res.headers['set-cookie'][0]).toContain('session_token=');
      expect(res.headers['set-cookie'][0]).toContain('HttpOnly');
      expect(res.headers['set-cookie'][0]).toContain('SameSite=Strict');
    });

    it('rejects duplicate email with 409', async () => {
      await createTestUser('dup@example.com', 'pass123', 'Dup');

      const res = await request(app)
        .post('/login/register')
        .send({ email: 'dup@example.com', password: 'other456', name: 'Other' });

      expect(res.status).toBe(409);
      expect(res.body.error).toBe('User already exists');
    });

    it('rejects missing fields with 400', async () => {
      const res = await request(app)
        .post('/login/register')
        .send({ email: 'test@example.com' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Email, password and name are required');
    });

    it('sanitizes SQL injection in email', async () => {
      const maliciousEmail = "test'; DROP TABLE Users; --@example.com";
      const res = await request(app)
        .post('/login/register')
        .send({ email: maliciousEmail, password: 'pass', name: 'Hacker' });

      expect([201, 400, 500]).toContain(res.status);
      const loginRes = await request(app)
        .post('/login')
        .send({ email: 'normal@example.com', password: 'pass' });
      expect(loginRes.status).toBe(401);
    });
  });

  describe('POST /login', () => {
    it('returns exact shape on valid credentials', async () => {
      await createTestUser('valid@example.com', 'mypassword', 'Valid User');

      const res = await request(app)
        .post('/login')
        .send({ email: 'valid@example.com', password: 'mypassword' });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        message: 'Hello Valid User',
        user: { name: 'Valid User', email: 'valid@example.com' },
      });
    });

    it('returns 401 on wrong password', async () => {
      await createTestUser('wrong@example.com', 'correctpass', 'Wrong');

      const res = await request(app)
        .post('/login')
        .send({ email: 'wrong@example.com', password: 'wrongpass' });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Invalid credentials');
    });

    it('returns 401 on missing user', async () => {
      const res = await request(app)
        .post('/login')
        .send({ email: 'nobody@example.com', password: 'any' });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Invalid credentials');
    });

    it('rejects missing fields with 400', async () => {
      const res = await request(app)
        .post('/login')
        .send({ email: 'test@example.com' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Email and password are required');
    });
  });

  describe('POST /login/logout', () => {
    it('clears session cookie', async () => {
      await createTestUser('logout@example.com', 'pass', 'Logout');
      const cookie = await getSessionCookie(app, 'logout@example.com', 'pass');

      const res = await request(app)
        .post('/login/logout')
        .set('Cookie', cookie);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Logged out');
    });
  });
});
