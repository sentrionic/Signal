export class MessageDeletedEvent {
  constructor(public readonly chatId: string, public readonly messageId: string) {}

  toString() {
    return JSON.stringify({
      chatId: this.chatId,
      messageId: this.messageId,
    });
  }
}
