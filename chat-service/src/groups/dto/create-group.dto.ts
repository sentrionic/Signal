import { ApiProperty } from '@nestjs/swagger';

export class CreateGroupDto {
  @ApiProperty({ type: String })
  name!: string;

  @ApiProperty({ type: [String] })
  ids!: string[];
}
