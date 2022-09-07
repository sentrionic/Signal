import { UserResponse } from './user.response';
import { RequestType } from '../entities/request.enum';

export interface RequestResponse {
  user: UserResponse;
  type: RequestType;
}
