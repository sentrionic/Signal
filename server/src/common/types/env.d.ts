declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string;
      DATABASE_URL: string;
      REDIS_URL: string;
      CORS_ORIGIN: string;
      SECRET: string;
      AWS_ACCESS_KEY: string;
      AWS_SECRET_ACCESS_KEY: string;
      AWS_STORAGE_BUCKET_NAME: string;
      AWS_S3_REGION: string;
    }
  }
}

export {};
