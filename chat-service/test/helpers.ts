import { User } from '../src/users/entities/user.entity';
import * as jwt from 'jsonwebtoken';

export const login = async (current: User): Promise<string> => {
  const payload = {
    userId: current.id,
  };

  const session = jwt.sign(payload, process.env.SESSION_SECRET ?? '');

  return `sgl=${session}; Path=/; Max-Age=3600; HttpOnly`;
};
