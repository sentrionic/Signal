import { ApiProperty } from '@nestjs/swagger';
import { ChatResponse } from '../../chats/dto/chat.response';
import { GroupResponse } from './group.response';

export class GroupChatResponse {
  @ApiProperty({ type: [ChatResponse] })
  chats!: ChatResponse[];

  @ApiProperty({ type: [GroupResponse] })
  groups!: GroupResponse[];
}
