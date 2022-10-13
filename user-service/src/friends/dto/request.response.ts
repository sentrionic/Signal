import { RequestType } from '../entities/request.enum';
import { ApiProperty } from '@nestjs/swagger';
import { UserResponse } from '../../users/dto/user.response';

export class RequestResponse {
  @ApiProperty({ type: UserResponse })
  user!: UserResponse;

  @ApiProperty({ enum: RequestType, enumName: 'Request Type' })
  type!: RequestType;
}
