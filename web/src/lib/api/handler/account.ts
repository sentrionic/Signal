import type { Account, LoginInput, RegisterInput } from '..';
import { handler } from '../handler';

export const login = async (input: LoginInput): Promise<Account> => {
  return await handler.post('accounts/login', { json: { ...input } }).json<Account>();
};

export const register = async (input: RegisterInput): Promise<Account> => {
  return await handler.post('accounts', { json: { ...input } }).json<Account>();
};

export const updateAccount = async (data: FormData): Promise<Account> => {
  return await handler.put('accounts', { body: data }).json<Account>();
};

export const logout = async (): Promise<void> => {
  await handler.post('accounts/logout');
};
