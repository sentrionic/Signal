import { UserResponse } from '../../types/user.response';

export class GroupMemberAddedEvent {
  constructor(public readonly chatId: string, public readonly user: UserResponse) {}

  toString() {
    return JSON.stringify({
      chatId: this.chatId,
      user: this.user,
    });
  }
}
