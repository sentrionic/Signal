import * as Joi from 'joi';

export const registerSchema = Joi.object({
  email: Joi.string().email().required().trim().lowercase(),
  displayName: Joi.string().min(3).max(30).trim().required(),
  password: Joi.string().min(6).max(150).required(),
});

export const updateAccountSchema = Joi.object({
  email: Joi.string().email().required().trim().lowercase(),
  displayName: Joi.string().min(3).max(30).trim().required(),
  bio: Joi.string().max(200).optional(),
});
