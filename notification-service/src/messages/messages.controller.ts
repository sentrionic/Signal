import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import {
  MessageCreatedEvent,
  MessageDeletedEvent,
  MessageUpdatedEvent,
  RmqService,
  Subjects,
} from '@senorg/common';
import { SocketService } from '../socket/socket.service';

@Controller()
export class MessagesController {
  constructor(
    private readonly socketService: SocketService,
    private readonly rmqService: RmqService,
  ) {}

  @EventPattern(Subjects.MessageCreated)
  handleMessageCreated(
    @Payload() { chatId, message }: MessageCreatedEvent,
    @Ctx() context: RmqContext,
  ) {
    this.socketService.sendMessage(chatId, message);
    this.rmqService.ack(context);
  }

  @EventPattern(Subjects.MessageUpdated)
  handleMessageUpdated(
    @Payload() { chatId, message }: MessageUpdatedEvent,
    @Ctx() context: RmqContext,
  ) {
    this.socketService.editMessage(chatId, message);
    this.rmqService.ack(context);
  }

  @EventPattern(Subjects.MessageDeleted)
  handleMessageDeleted(
    @Payload() { chatId, messageId }: MessageDeletedEvent,
    @Ctx() context: RmqContext,
  ) {
    this.socketService.deleteMessage(chatId, messageId);
    this.rmqService.ack(context);
  }
}
