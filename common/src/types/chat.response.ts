import { ChatType } from './chat-type.enum';
import { GroupResponse } from './group.response';
import { MessageResponse } from './message.response';
import { UserResponse } from './user.response';

export class ChatResponse {
  id!: string;
  type!: ChatType;
  user?: UserResponse | null;
  group?: GroupResponse | null;
  lastMessage?: MessageResponse | null;
  hasNotification!: boolean;
}
