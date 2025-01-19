declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      RESEND_API_KEY: string;
      JWT_SECRET: string;
      NEXT_PUBLIC_APP_URL: string;
      NODE_ENV: "development" | "production" | "test";
    }
  }
}

export {};
