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

router.post('/webhook', async (req, res) => {
  try {
    const message = req.body.message || req.body.edited_message;
    if (!message || !message.text) {
      return res.sendStatus(200);
    }

    const text = message.text.trim();
    const chatId = String(message.chat.id);

    if (text.startsWith('/start')) {
      const parts = text.split(' ');
      const token = parts[1];
      if (!token) {
        return res.sendStatus(200);
      }

      const linkToken = await TelegramLinkToken.findOne({
        where: { token },
        include: [{ model: User }],
      });

      if (!linkToken || new Date() > new Date(linkToken.getDataValue('expiresAt'))) {
        return res.sendStatus(200);
      }

      const user = linkToken.getDataValue('User');
      if (user) {
        user.setDataValue('telegramChatId', chatId);
        await user.save();
        await linkToken.destroy();
      }
    }

    return res.sendStatus(200);
  } catch (error) {
    console.error('Error handling Telegram webhook', error);
    return res.sendStatus(200);
  }
});

export default router;
