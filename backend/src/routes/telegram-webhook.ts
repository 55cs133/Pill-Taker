import express from 'express';

import { User } from '@/models/user';
import { TelegramLinkToken } from '@/models/telegram-link-token';

const router = express.Router();

router.post('/', async (req, res) => {
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
        await User.update(
          { telegramChatId: chatId },
          { where: { id: user.getDataValue('id') } },
        );
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
