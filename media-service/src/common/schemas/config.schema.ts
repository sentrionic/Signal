import { object, string } from 'yup';

export const ConfigSchema = object({
  SESSION_SECRET: string().required(),
  RABBIT_MQ_URI: string().required(),
  RABBIT_MQ_MEDIA_QUEUE: string().required(),
  AWS_ACCESS_KEY: string().required(),
  AWS_SECRET_ACCESS_KEY: string().required(),
  AWS_STORAGE_BUCKET_NAME: string().required(),
  AWS_S3_REGION: string().required(),
});
