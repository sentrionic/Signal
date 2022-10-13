import { ChatResponse } from '../../types/chat.response';

export class GroupMemberJoinedEvent {
  constructor(public readonly receiverId: string, public readonly chat: ChatResponse) {}

  toString() {
    return JSON.stringify({
      receiverId: this.receiverId,
      chat: this.chat,
    });
  }
}
