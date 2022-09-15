import { Message } from '../entities/message.entity';
import { getMockUser } from '../../users/mocks/user.mock';

export const getMockMessage = (): Message => new Message(getMockUser());
