export class ChatMembersAddedEvent {
  constructor(public readonly userIds: string[], public readonly chatId: string) {}

  toString() {
    return JSON.stringify({
      userIds: this.userIds,
      chatId: this.chatId,
    });
  }
}
