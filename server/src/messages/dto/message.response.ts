import { ApiProperty } from '@nestjs/swagger';
import { UserResponse } from '../../friends/dto/user.response';
import { AttachmentResponse } from './attachment.response';
import { MessageType } from '../entities/message-type.enum';

export class MessageResponse {
  @ApiProperty({ type: String })
  id!: string;

  @ApiProperty({ enum: MessageType })
  type!: MessageType;

  @ApiProperty({ type: String, nullable: true })
  text?: string | null;

  @ApiProperty({ type: UserResponse })
  user!: UserResponse;

  @ApiProperty({ type: AttachmentResponse, nullable: true })
  attachment?: AttachmentResponse | null;

  @ApiProperty({ type: String })
  sentAt!: string;

  @ApiProperty({ type: String })
  deliveredAt!: string;

  @ApiProperty({ type: String })
  seenAt!: string;
}
