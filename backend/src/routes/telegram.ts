import express from 'express';
import crypto from 'crypto';

import { User } from '@/models/user';
import { TelegramLinkToken } from '@/models/telegram-link-token';

const router = express.Router();
const TELEGRAM_BOT_NAME = process.env.TELEGRAM_BOT_NAME || '';
const TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

router.get('/link-url', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = crypto.randomBytes(16).toString('hex');
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MS);

    await TelegramLinkToken.create({
      token,
      expiresAt,
      UserId: userId,
    });

    const linkUrl = `https://t.me/${TELEGRAM_BOT_NAME}?start=${token}`;
    return res.status(200).json({ linkUrl, token });
  } catch (error) {
    console.error('Error generating Telegram link', error);
    return res.status(500).json({ error: 'An error has occured.' });
  }
});

export default router;
