import { MessageResponse } from '../../types/message.response';

export class MessageUpdatedEvent {
  constructor(public readonly chatId: string, public readonly message: MessageResponse) {}

  toString() {
    return JSON.stringify({
      chatId: this.chatId,
      message: this.message,
    });
  }
}
