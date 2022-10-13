import { ApiProperty } from '@nestjs/swagger';

export class GroupResponse {
  @ApiProperty({ type: String })
  id!: string;

  @ApiProperty({ type: String })
  name!: string;

  @ApiProperty({ type: String })
  image!: string;

  @ApiProperty({ type: String })
  createdAt!: string;

  @ApiProperty({ type: Number })
  memberCount!: number;
}
