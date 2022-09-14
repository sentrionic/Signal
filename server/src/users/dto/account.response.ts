import { ApiProperty } from '@nestjs/swagger';

export class Account {
  @ApiProperty({ type: String })
  id!: string;

  @ApiProperty({ type: String })
  email!: string;

  @ApiProperty({ type: String })
  username!: string;

  @ApiProperty({ type: String })
  displayName!: string;

  @ApiProperty({ type: String })
  image!: string;

  @ApiProperty({ type: String })
  bio!: string;
}
