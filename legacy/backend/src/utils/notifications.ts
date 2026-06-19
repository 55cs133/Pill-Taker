import axios from 'axios';
import nodemailer from 'nodemailer';

const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;

const smtpTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendTelegramNotification(chatId: string, message: string) {
  if (!telegramBotToken || !chatId) return;
  try {
    await axios.post(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML',
    });
  } catch (error) {
    console.error('Failed to send Telegram notification:', error);
  }
}

export async function sendEmailNotification(to: string, subject: string, html: string) {
  if (!process.env.SMTP_HOST || !to) return;
  try {
    await smtpTransporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error('Failed to send email notification:', error);
  }
}
