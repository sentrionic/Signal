import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import {
  ChatUpdateLastSeenEvent,
  RmqService,
  Subjects,
  UserCreatedEvent,
  UserUpdatedEvent,
} from '@senorg/common';
import { UsersService } from './users.service';

@Controller()
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly rmqService: RmqService,
  ) {}

  @EventPattern(Subjects.UserCreated)
  async handleUserCreated(
    @Payload() payload: UserCreatedEvent,
    @Ctx() context: RmqContext,
  ): Promise<void> {
    await this.usersService.insertUser(payload);
    this.rmqService.ack(context);
  }

  @EventPattern(Subjects.UserUpdated)
  async handleUserUpdated(
    @Payload() payload: UserUpdatedEvent,
    @Ctx() context: RmqContext,
  ): Promise<void> {
    await this.usersService.updateUser(payload);
    this.rmqService.ack(context);
  }

  @EventPattern(Subjects.ChatUpdateLastSeen)
  async handleChatLastSeen(
    @Payload() { userId, chatId }: ChatUpdateLastSeenEvent,
    @Ctx() context: RmqContext,
  ): Promise<void> {
    await this.usersService.updateLastSeen(userId, chatId);
    this.rmqService.ack(context);
  }

  @EventPattern(Subjects.UserUpdateLastOnline)
  async handleUpdateLastOnline(
    @Payload() userId: string,
    @Ctx() context: RmqContext,
  ): Promise<void> {
    await this.usersService.updateLastOnline(userId);
    this.rmqService.ack(context);
  }
}
