import { object, string, number } from 'yup';

export const ConfigSchema = object({
  DATABASE_URL: string().required(),
  RABBIT_MQ_URI: string().required(),
  PORT: number().required(),
  SESSION_SECRET: string().required(),
  COOKIE_NAME: string().required(),
  SESSION_DURATION: number().required(),
});
