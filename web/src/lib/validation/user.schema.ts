import { object, string } from 'yup';

export const RegisterSchema = object().shape({
  displayName: string()
    .min(3)
    .max(30)
    .trim()
    .required('Display Name is required')
    .defined('Display Name is required'),
  email: string().email().lowercase().required('Email is required').defined('Email is required'),
  password: string()
    .min(6, 'Password must be at least 6 characters long')
    .max(150)
    .required('Password is required')
    .defined('Password is required'),
});

export const LoginSchema = object().shape({
  email: string().email().lowercase().required('Email is required').defined('Email is required'),
  password: string()
    .min(6, 'Password must be at least 6 characters long')
    .max(150)
    .required('Password is required')
    .defined('Password is required'),
});

export const UpdateSchema = object().shape({
  displayName: string()
    .min(3)
    .max(30)
    .trim()
    .required('Display Name is required')
    .defined('Display Name is required'),
  email: string().email().lowercase().required('Email is required').defined('Email is required'),
});
