import { ApiProperty } from '@nestjs/swagger';

export class LoginInput {
  @ApiProperty({
    type: String,
    description: 'Unique. Must be a valid email.',
  })
  email!: string;

  @ApiProperty({ type: String, description: 'Min 6, max 150 characters.' })
  password!: string;
}
