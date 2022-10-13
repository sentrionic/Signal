import { ApiProperty } from '@nestjs/swagger';

export class AddRequestDto {
  @ApiProperty({ type: String })
  username!: string;
}
