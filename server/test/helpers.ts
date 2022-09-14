import * as request from 'supertest';
import { User } from '../src/users/entities/user.entity';

export const login = async (server: any, current: User): Promise<string> => {
  const { headers } = await request(server).post('/api/accounts/login').send({
    email: current.email,
    password: 'password',
  });

  const session = headers['set-cookie'][0];
  expect(session).toBeDefined();

  return session;
};
