import { MessageResponse } from '../dto/message.response';
import { RequestResponse } from '../../friends/dto/request.response';
import { UserResponse } from '../../friends/dto/user.response';
import { ChatResponse } from '../../chats/dto/chat.response';

export const mockSocketService = {
  sendMessage: (_: string, __: MessageResponse) => {
    return;
  },
  editMessage: (_: string, __: MessageResponse) => {
    return;
  },
  deleteMessage: (_: string, __: MessageResponse) => {
    return;
  },
  addRequest: (_: string, __: RequestResponse) => {
    return;
  },
  addFriend: (_: UserResponse, __: UserResponse) => {
    return;
  },
  removeFriend: (_: string, __: string) => {
    return;
  },
  addMember: (_: string, __: UserResponse) => {
    return;
  },
  removeMember: (_: string, __: string) => {
    return;
  },
  sendChat: (_: string, __: ChatResponse) => {
    return;
  },
};
