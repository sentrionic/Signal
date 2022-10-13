import { object, string, number } from 'yup';

export const ConfigSchema = object({
  DATABASE_URL: string().required(),
  PORT: number().required(),
  SESSION_SECRET: string().required(),
  RABBIT_MQ_URI: string().required(),
});
