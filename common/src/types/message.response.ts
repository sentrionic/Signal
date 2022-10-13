import { AttachmentResponse } from './attachment.response';
import { MessageType } from './message-type.enum';
import { UserResponse } from './user.response';

export class MessageResponse {
  id!: string;
  type!: MessageType;
  text?: string | null;
  user!: UserResponse;
  attachment?: AttachmentResponse | null;
  sentAt!: string;
  updatedAt!: string;
  deliveredAt?: string | null;
  seenAt?: string;
}
