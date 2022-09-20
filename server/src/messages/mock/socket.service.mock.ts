import { MessageResponse } from '../dto/message.response';
import { RequestResponse } from '../../friends/dto/request.response';
import { UserResponse } from '../../friends/dto/user.response';

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
};
