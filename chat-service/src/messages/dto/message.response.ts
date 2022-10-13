import { ApiProperty } from '@nestjs/swagger';
import { AttachmentResponse } from './attachment.response';
import { MessageType } from '../entities/message-type.enum';
import { UserResponse } from '../../users/dto/user.response';

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
  updatedAt!: string;

  @ApiProperty({ type: String, nullable: true })
  deliveredAt?: string | null;

  @ApiProperty({ type: String, nullable: true })
  seenAt?: string;
}
