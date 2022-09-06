import { User } from '../entities/user.entity';
import { getEmail, getRandomString } from '../../common/utils/faker';

export const userMock: User = new User('test@example.com', 'Test', 'password');

export const getMockUser = (): User => new User(getEmail(), getRandomString(), 'password');
