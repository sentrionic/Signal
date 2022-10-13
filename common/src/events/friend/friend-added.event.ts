import { UserResponse } from '../../types/user.response';

export class FriendAddedEvent {
  constructor(public readonly current: UserResponse, public readonly friend: UserResponse) {}

  toString() {
    return JSON.stringify({
      current: this.current,
      friend: this.friend,
    });
  }
}
