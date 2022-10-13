import { ApiProperty } from '@nestjs/swagger';

export class AddUserDto {
  @ApiProperty({ type: String })
  username!: string;
}
