import { User } from '../entities/user.entity';
import { getEmail, getRandomString } from '@senorg/common';

export const userMock: User = new User('test@example.com', 'Test', 'password');

export const getMockUser = (): User => new User(getEmail(), getRandomString(), 'password');
