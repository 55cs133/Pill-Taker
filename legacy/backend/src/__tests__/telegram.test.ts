import { describe, it, expect, beforeEach } from 'vitest';

import { createTestApp, cleanupDb, createTestUser, getSessionCookie, request } from './helpers';
import { TelegramLinkToken } from '@/models/telegram-link-token';
import { User } from '@/models/user';

describe('Telegram', () => {
  let app: any;
  let cookie: string;
  let user: any;

  beforeEach(async () => {
    app = await createTestApp();
    await cleanupDb();
    user = await createTestUser('tg@example.com', 'pass', 'TG User');
    cookie = await getSessionCookie(app, 'tg@example.com', 'pass');
  });

  describe('GET /telegram/link-url', () => {
    it('requires authentication', async () => {
      const res = await request(app).get('/telegram/link-url');
      expect(res.status).toBe(401);
    });

    it('generates 32-char hex token with 1h expiry', async () => {
      const res = await request(app)
        .get('/telegram/link-url')
        .set('Cookie', cookie);

      expect(res.status).toBe(200);
      expect(res.body.token).toMatch(/^[0-9a-f]{32}$/);
      expect(res.body.linkUrl).toContain(res.body.token);

      const tokens = await TelegramLinkToken.findAll({ where: { UserId: user.getDataValue('id') } });
      expect(tokens).toHaveLength(1);

      const expiresAt = new Date(tokens[0].getDataValue('expiresAt'));
      const now = new Date();
      const diffMs = expiresAt.getTime() - now.getTime();
      expect(diffMs).toBeGreaterThan(59 * 60 * 1000);
      expect(diffMs).toBeLessThanOrEqual(60 * 60 * 1000);
    });
  });

  describe('POST /telegram/webhook', () => {
    it('links telegram chatId via /start token', async () => {
      const linkRes = await request(app)
        .get('/telegram/link-url')
        .set('Cookie', cookie);
      const token = linkRes.body.token;

      const res = await request(app)
        .post('/telegram/webhook')
        .send({
          message: {
            text: `/start ${token}`,
            chat: { id: 987654321 },
          },
        });

      expect(res.status).toBe(200);

      // Verify user updated via DB query
      const updatedUser = await User.findByPk(user.getDataValue('id'));
      expect(updatedUser?.getDataValue('telegramChatId')).toBe('987654321');

      // Verify token destroyed
      const tokens = await TelegramLinkToken.findAll({ where: { token } });
      expect(tokens).toHaveLength(0);
    });

    it('ignores expired token', async () => {
      await TelegramLinkToken.create({
        token: 'expired-token-123',
        expiresAt: new Date(Date.now() - 1000),
        UserId: user.getDataValue('id'),
      });

      const res = await request(app)
        .post('/telegram/webhook')
        .send({
          message: {
            text: '/start expired-token-123',
            chat: { id: 111111111 },
          },
        });

      expect(res.status).toBe(200);
      const updatedUser = await User.findByPk(user.getDataValue('id'));
      expect(updatedUser?.getDataValue('telegramChatId')).toBeNull();
    });

    it('handles malformed payload gracefully', async () => {
      const res = await request(app)
        .post('/telegram/webhook')
        .send({ malformed: true });

      expect(res.status).toBe(200);
    });

    it('ignores missing token after /start', async () => {
      const res = await request(app)
        .post('/telegram/webhook')
        .send({
          message: {
            text: '/start',
            chat: { id: 222222222 },
          },
        });

      expect(res.status).toBe(200);
    });
  });
});
