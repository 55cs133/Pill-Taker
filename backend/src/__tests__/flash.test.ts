import { describe, it, expect, beforeEach, vi } from 'vitest';
import axios from 'axios';

import { createTestApp, cleanupDb, createTestUser, createTestTreatment, request } from './helpers';
import { Dose } from '@/models/dose';
import { User } from '@/models/user';
import * as notifications from '@/utils/notifications';

describe('Flash', () => {
  let app: any;
  let user: any;
  let treatment: any;

  beforeEach(async () => {
    app = await createTestApp();
    await cleanupDb();
    user = await createTestUser('flash@example.com', 'pass', 'Flash User');
    treatment = await createTestTreatment(user.getDataValue('id'), 'FlashMed', 8);
    vi.clearAllMocks();
  });

  describe('POST /flash/:slug', () => {
    it('records dose without authentication', async () => {
      const slug = treatment.getDataValue('slug');
      const res = await request(app)
        .post(`/flash/${slug}`)
        .send({});

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Dose recorded successfully');
      expect(res.body.dose.treatmentName).toBe('FlashMed');
      expect(res.body.dose.id).toBeDefined();
      expect(res.body.dose.takenAt).toBeDefined();

      const doses = await Dose.findAll({ where: { TreatmentId: treatment.getDataValue('id') } });
      expect(doses).toHaveLength(1);
      expect(doses[0].getDataValue('confirmedVia')).toBe('qr_scan');
      const createdAt = new Date(doses[0].getDataValue('createdAt'));
      expect(Date.now() - createdAt.getTime()).toBeLessThan(5000);
    });

    it('returns 404 for invalid slug', async () => {
      const res = await request(app).post('/flash/invalid-slug-123');
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Treatment not found');
    });

    it('sends Telegram notification when user has chatId', async () => {
      user.setDataValue('telegramChatId', '123456789');
      await user.save();

      const slug = treatment.getDataValue('slug');
      await request(app).post(`/flash/${slug}`);

      expect(axios.post).toHaveBeenCalledTimes(1);
      expect(axios.post).toHaveBeenCalledWith(
        'https://api.telegram.org/bottest-bot-token/sendMessage',
        expect.objectContaining({
          chat_id: '123456789',
          parse_mode: 'HTML',
        }),
      );
    });

    it('sends email notification when user has email', async () => {
      const sendEmailSpy = vi.spyOn(notifications, 'sendEmailNotification').mockResolvedValue(undefined);

      const slug = treatment.getDataValue('slug');
      await request(app).post(`/flash/${slug}`);

      expect(sendEmailSpy).toHaveBeenCalledTimes(1);
      expect(sendEmailSpy).toHaveBeenCalledWith(
        'flash@example.com',
        expect.stringContaining('FlashMed'),
        expect.stringContaining('FlashMed'),
      );
    });

    it('sends no notifications when user lacks contact info', async () => {
      await User.update(
        { telegramChatId: null },
        { where: { id: user.getDataValue('id') } },
      );

      const slug = treatment.getDataValue('slug');
      await request(app).post(`/flash/${slug}`);

      expect(axios.post).not.toHaveBeenCalled();
    });
  });
});
