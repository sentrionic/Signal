import * as Joi from 'joi';

export const configSchema = Joi.object({
  DATABASE_URL: Joi.string().required(),
  PORT: Joi.number().required(),
  CORS_ORIGIN: Joi.string().required(),
  SECRET: Joi.string().required(),
  AWS_ACCESS_KEY: Joi.string().required(),
  AWS_SECRET_ACCESS_KEY: Joi.string().required(),
  AWS_STORAGE_BUCKET_NAME: Joi.string().required(),
  AWS_S3_REGION: Joi.string().required(),
  COOKIE_NAME: Joi.string().required(),
});
