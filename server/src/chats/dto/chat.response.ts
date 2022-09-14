import { UserResponse } from '../../friends/dto/user.response';
import { ApiProperty } from '@nestjs/swagger';

export class ChatResponse {
  @ApiProperty({ type: String })
  id!: string;

  @ApiProperty({ type: UserResponse })
  user!: UserResponse;
}
