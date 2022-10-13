import { MessageResponse } from '../../types/message.response';

export class MessageCreatedEvent {
  constructor(public readonly chatId: string, public readonly message: MessageResponse) {}

  toString() {
    return JSON.stringify({
      chatId: this.chatId,
      message: this.message,
    });
  }
}
