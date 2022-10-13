export class ChatUpdateLastSeenEvent {
  constructor(public readonly userId: string, public readonly chatId: string) {}

  toString() {
    return JSON.stringify({
      userId: this.userId,
      chatId: this.chatId,
    });
  }
}
