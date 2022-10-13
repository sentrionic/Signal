import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import {
  ChatMembersAddedEvent,
  GroupMemberAddedEvent,
  GroupMemberJoinedEvent,
  GroupMemberRemovedEvent,
  RmqService,
  Subjects,
} from '@senorg/common';
import { SocketService } from '../socket/socket.service';
import { ChatsService } from './chats.service';

@Controller()
export class ChatsController {
  constructor(
    private readonly chatsService: ChatsService,
    private readonly rmqService: RmqService,
    private readonly socketService: SocketService,
  ) {}

  @EventPattern(Subjects.ChatMembersAdded)
  async handleChatMemberAdded(
    @Payload() { userIds, chatId }: ChatMembersAddedEvent,
    @Ctx() context: RmqContext,
  ): Promise<void> {
    await this.chatsService.insertChatMember(userIds, chatId);
    this.rmqService.ack(context);
  }

  @EventPattern(Subjects.GroupMemberAdded)
  handleGroupMemberAdded(
    @Payload() { user, chatId }: GroupMemberAddedEvent,
    @Ctx() context: RmqContext,
  ): void {
    this.socketService.addMember(chatId, user);
    this.rmqService.ack(context);
  }

  @EventPattern(Subjects.GroupMemberRemoved)
  async handleGroupMemberRemoved(
    @Payload() { userId, chatId }: GroupMemberRemovedEvent,
    @Ctx() context: RmqContext,
  ): Promise<void> {
    await this.chatsService.removeChatMember(userId, chatId);
    this.socketService.removeMember(chatId, userId);
    this.rmqService.ack(context);
  }

  @EventPattern(Subjects.GroupMemberJoined)
  handleGroupMemberJoined(
    @Payload() { chat, receiverId }: GroupMemberJoinedEvent,
    @Ctx() context: RmqContext,
  ): void {
    this.socketService.sendChat(receiverId, chat);
    this.rmqService.ack(context);
  }
}
