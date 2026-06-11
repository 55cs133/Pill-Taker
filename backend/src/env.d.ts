declare namespace NodeJS {
  interface ProcessEnv {
    BACK: number;
    FRONT: number;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    REDIRECT_URI: string;
    JWT_SECRET: string;
  }
}
