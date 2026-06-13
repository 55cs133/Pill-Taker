declare namespace NodeJS {
  interface ProcessEnv {
    BACK: number;
    FRONT: number;
    JWT_SECRET: string;
    DB_HOST: string;
    DB_USER: string;
    DB_PASSWORD: string;
    DB_NAME: string;
    DB_PORT: string;
    PUBLIC_URL: string;
    TELEGRAM_BOT_TOKEN: string;
    TELEGRAM_BOT_NAME: string;
    SMTP_HOST: string;
    SMTP_PORT: string;
    SMTP_SECURE: string;
    SMTP_USER: string;
    SMTP_PASS: string;
    SMTP_FROM: string;
    NODE_ENV: string;
  }
}
