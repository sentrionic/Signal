export class GroupMemberRemovedEvent {
  constructor(public readonly chatId: string, public readonly userId: string) {}

  toString() {
    return JSON.stringify({
      chatId: this.chatId,
      user: this.userId,
    });
  }
}
