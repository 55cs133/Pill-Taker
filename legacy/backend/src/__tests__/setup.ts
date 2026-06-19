import { vi } from 'vitest';
import { Sequelize } from 'sequelize';

// Create a test Sequelize instance
export const testSequelize = new Sequelize({
  dialect: 'sqlite',
  storage: ':memory:',
  logging: false,
});

// Mock the database module before any imports
vi.mock('@/config/database', () => ({
  default: testSequelize,
}));

// Mock nodemailer
vi.mock('nodemailer', () => ({
  default: {
    createTransport: vi.fn(() => ({
      sendMail: vi.fn().mockResolvedValue(undefined),
    })),
  },
}));

// Mock axios
vi.mock('axios', async () => {
  const actual = await vi.importActual<typeof import('axios')>('axios');
  return {
    ...actual,
    default: {
      ...actual.default,
      post: vi.fn().mockResolvedValue({ data: { ok: true } }),
      get: vi.fn().mockResolvedValue({ data: {} }),
    },
  };
});

// Set test env vars
process.env.JWT_SECRET = 'test-secret-key-for-testing-only';
process.env.PUBLIC_URL = 'http://localhost:8080';
process.env.TELEGRAM_BOT_TOKEN = 'test-bot-token';
process.env.TELEGRAM_BOT_NAME = 'TestBot';
process.env.SMTP_HOST = 'smtp.test.com';
process.env.SMTP_PORT = '587';
process.env.SMTP_USER = 'test@test.com';
process.env.SMTP_PASS = 'testpass';
process.env.SMTP_FROM = 'noreply@test.com';
