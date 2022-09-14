import { UserResponse } from './user.response';
import { RequestType } from '../entities/request.enum';
import { ApiProperty } from '@nestjs/swagger';

export class RequestResponse {
  @ApiProperty({ type: UserResponse })
  user!: UserResponse;

  @ApiProperty({ enum: RequestType, enumName: 'Request Type' })
  type!: RequestType;
}
