import { Message } from '../entities/message.entity';
import { getMockUser } from '../../users/mocks/user.mock';
import { getMockChat } from '../../chats/mocks/chat.mock';

export const getMockMessage = (): Message => new Message(getMockUser(), getMockChat());
