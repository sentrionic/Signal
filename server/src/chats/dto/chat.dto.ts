import { ApiProperty } from '@nestjs/swagger';

export class ChatDto {
  @ApiProperty({ type: String })
  contactID!: string;
}
