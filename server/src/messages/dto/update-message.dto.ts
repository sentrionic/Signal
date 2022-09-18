import { ApiProperty } from '@nestjs/swagger';

export class UpdateMessageDto {
  @ApiProperty({
    type: String,
    description: 'The new message.',
  })
  text!: string;
}
