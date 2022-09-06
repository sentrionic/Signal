import { object, string, number } from 'yup';

export const ConfigSchema = object({
  DATABASE_URL: string().required(),
  PORT: number().required(),
  CORS_ORIGIN: string().required(),
  SECRET: string().required(),
  AWS_ACCESS_KEY: string().required(),
  AWS_SECRET_ACCESS_KEY: string().required(),
  AWS_STORAGE_BUCKET_NAME: string().required(),
  AWS_S3_REGION: string().required(),
  COOKIE_NAME: string().required(),
});
