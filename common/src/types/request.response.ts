import { RequestType } from './request.enum';
import { UserResponse } from './user.response';

export interface RequestResponse {
  user: UserResponse;
  type: RequestType;
}
