import { MessageResponse } from '../dto/message.response';
import { RequestResponse } from '../../friends/dto/request.response';
import { UserResponse } from '../../friends/dto/user.response';
import { ChatResponse } from '../../chats/dto/chat.response';
import { ISocketService } from '../../socket/socket.service';
import { Socket } from 'socket.io';

export const mockSocketService: ISocketService = {
  addTyping(_: string, __: string): void {
    return;
  },
  joinChat(_: Socket, __: string): Promise<void> {
    return Promise.resolve();
  },
  stopTyping(_: string, __: string): void {
    return;
  },
  updateLastOnline(_: Socket): Promise<void> {
    return Promise.resolve();
  },
  sendMessage(_: string, __: MessageResponse) {
    return;
  },
  editMessage(_: string, __: MessageResponse) {
    return;
  },
  deleteMessage(_: string, __: string) {
    return;
  },
  addRequest(_: string, __: RequestResponse) {
    return;
  },
  addFriend(_: UserResponse, __: UserResponse) {
    return;
  },
  removeFriend(_: string, __: string) {
    return;
  },
  addMember(_: string, __: UserResponse) {
    return;
  },
  removeMember(_: string, __: string) {
    return;
  },
  sendChat(_: string, __: ChatResponse) {
    return;
  },
  updateLastSeen(_: Socket, __: string): Promise<void> {
    return Promise.resolve(undefined);
  },
};
