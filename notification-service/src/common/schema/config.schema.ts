import { object, string, number } from 'yup';

export const ConfigSchema = object({
  PORT: number().required(),
  SESSION_SECRET: string().required(),
  RABBIT_MQ_URI: string().required(),
  COOKIE_NAME: string().required(),
  DATABASE_URL: string().required(),
});
