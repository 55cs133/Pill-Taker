import bcrypt from 'bcrypt';
import supertest from 'supertest';

import { testSequelize } from './setup';
import { createServer } from '@/server';
import { setupAssociations } from '@/models/associations';
import '@/models/dose';
import '@/models/telegram-link-token';
import { User } from '@/models/user';
import { Treatment } from '@/models/treatment';

export async function createTestApp() {
  setupAssociations();
  await testSequelize.sync({ force: true });
  const app = await createServer();
  return app;
}

export async function cleanupDb() {
  await testSequelize.sync({ force: true });
}

export async function createTestUser(email: string, password: string, name: string) {
  const passwordHash = await bcrypt.hash(password, 10);
  return User.create({ email, passwordHash, name });
}

export async function getSessionCookie(app: any, email: string, password: string): Promise<string> {
  const res = await supertest(app).post('/login').send({ email, password });
  if (res.status !== 200) {
    throw new Error(`Login failed: ${res.status} ${JSON.stringify(res.body)}`);
  }
  const cookies = res.headers['set-cookie'];
  if (!cookies || !cookies.length) {
    throw new Error('No session cookie returned');
  }
  return cookies[0];
}

export async function createTestTreatment(userId: number, name: string, interval: number, medicines: any[] = [{ name: 'Med', dosage: '10mg', quantity: '1' }]) {
  return Treatment.create({
    name,
    interval,
    medicine: medicines,
    slug: crypto.randomUUID(),
    UserId: userId,
  });
}

export { supertest as request };
