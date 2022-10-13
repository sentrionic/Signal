import { ApiProperty } from '@nestjs/swagger';
import { ChatType } from '../entities/chat-type.enum';
import { GroupResponse } from '../../groups/dto/group.response';
import { MessageResponse } from '../../messages/dto/message.response';
import { UserResponse } from '../../users/dto/user.response';

export class ChatResponse {
  @ApiProperty({ type: String })
  id!: string;

  @ApiProperty({ enum: ChatType })
  type!: ChatType;

  @ApiProperty({ type: UserResponse, nullable: true })
  user?: UserResponse | null;

  @ApiProperty({ type: GroupResponse, nullable: true })
  group?: GroupResponse | null;

  @ApiProperty({ type: MessageResponse, nullable: true })
  lastMessage?: MessageResponse | null;

  @ApiProperty({ type: Boolean })
  hasNotification!: boolean;
}
