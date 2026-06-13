import { describe, it, expect, beforeEach } from 'vitest';

import { createTestApp, cleanupDb, createTestUser, getSessionCookie, createTestTreatment, request } from './helpers';
import { Treatment } from '@/models/treatment';

describe('Treatments', () => {
  let app: any;
  let cookieA: string;
  let cookieB: string;
  let userA: any;
  let userB: any;

  beforeEach(async () => {
    app = await createTestApp();
    await cleanupDb();
    userA = await createTestUser('a@example.com', 'pass', 'User A');
    userB = await createTestUser('b@example.com', 'pass', 'User B');
    cookieA = await getSessionCookie(app, 'a@example.com', 'pass');
    cookieB = await getSessionCookie(app, 'b@example.com', 'pass');
  });

  describe('POST /treatments', () => {
    it('creates treatment with UUID slug and exact DB state', async () => {
      const res = await request(app)
        .post('/treatments')
        .set('Cookie', cookieA)
        .send({
          treatmentName: 'Antibiotics',
          interval: '8',
          medicines: [{ name: 'Amox', dosage: '500mg', quantity: '2' }],
        });

      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Antibiotics');
      expect(res.body.interval).toBe(8);
      expect(res.body.medicine).toEqual([{ name: 'Amox', dosage: '500mg', quantity: '2' }]);
      expect(res.body.slug).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
      expect(res.body.UserId).toBe(userA.getDataValue('id'));

      const treatments = await Treatment.findAll({ where: { UserId: userA.getDataValue('id') } });
      expect(treatments).toHaveLength(1);
      expect(treatments[0].getDataValue('name')).toBe('Antibiotics');
    });

    it('requires authentication', async () => {
      const res = await request(app)
        .post('/treatments')
        .send({ treatmentName: 'X', interval: '1', medicines: [] });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /treatments', () => {
    it('returns only user A treatments', async () => {
      await createTestTreatment(userA.getDataValue('id'), 'A1', 8);
      await new Promise((r) => setTimeout(r, 50)); // Ensure different timestamps
      await createTestTreatment(userA.getDataValue('id'), 'A2', 12);
      await createTestTreatment(userB.getDataValue('id'), 'B1', 6);
      await createTestTreatment(userB.getDataValue('id'), 'B2', 4);
      await createTestTreatment(userB.getDataValue('id'), 'B3', 10);

      const res = await request(app)
        .get('/treatments')
        .set('Cookie', cookieA);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      const names = res.body.map((t: any) => t.name);
      expect(names).toContain('A1');
      expect(names).toContain('A2');
      expect(names).not.toContain('B1');
    });

    it('requires authentication', async () => {
      const res = await request(app).get('/treatments');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /treatments/:id/qr', () => {
    it('returns SVG with correct content-type', async () => {
      const treatment = await createTestTreatment(userA.getDataValue('id'), 'QR Test', 8);

      const res = await request(app)
        .get(`/treatments/${treatment.getDataValue('id')}/qr`)
        .set('Cookie', cookieA);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('image/svg+xml');
      const bodyText = res.text || Buffer.from(res.body).toString();
      expect(bodyText).toContain('<svg');
      expect(bodyText).toContain('xmlns="http://www.w3.org/2000/svg"');
    });

    it('returns 404 for other user treatment', async () => {
      const treatment = await createTestTreatment(userB.getDataValue('id'), 'B Treatment', 8);

      const res = await request(app)
        .get(`/treatments/${treatment.getDataValue('id')}/qr`)
        .set('Cookie', cookieA);

      expect(res.status).toBe(404);
    });

    it('requires authentication', async () => {
      const res = await request(app).get('/treatments/1/qr');
      expect(res.status).toBe(401);
    });
  });
});
