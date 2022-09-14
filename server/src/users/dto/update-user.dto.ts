import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserInput {
  @ApiProperty({ type: String, description: 'Unique. Must be a valid email.' })
  email!: string;

  @ApiProperty({
    type: String,
    description: 'Min 3, max 30 characters.',
  })
  displayName!: string;

  @ApiProperty({
    type: String,
    description: 'At most 200 characters.',
  })
  bio!: string;
}
