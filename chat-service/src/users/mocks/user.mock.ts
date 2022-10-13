import { User } from '../entities/user.entity';
import { getRandomString } from '@senorg/common';

export const getMockUser = (): User =>
  new User(
    getRandomString(),
    getRandomString(),
    getRandomString(),
    getRandomString(),
    getRandomString(),
  );
