import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import {
  FriendAddedEvent,
  FriendRemovedEvent,
  RequestAddedEvent,
  RmqService,
  Subjects,
  UserCreatedEvent,
} from '@senorg/common';
import { SocketService } from '../socket/socket.service';
import { FriendService } from './friend.service';

@Controller()
export class FriendsController {
  constructor(
    private readonly rmqService: RmqService,
    private readonly socketService: SocketService,
    private readonly friendService: FriendService,
  ) {}

  @EventPattern(Subjects.UserCreated)
  async handleUserCreated(
    @Payload() data: UserCreatedEvent,
    @Ctx() context: RmqContext,
  ): Promise<void> {
    this.friendService.addUser(data);
    this.rmqService.ack(context);
  }

  @EventPattern(Subjects.FriendAdded)
  async handleFriendAdded(
    @Payload() { current, friend }: FriendAddedEvent,
    @Ctx() context: RmqContext,
  ): Promise<void> {
    this.friendService.insertFriend(current, friend);
    this.socketService.addFriend(current, friend);
    this.rmqService.ack(context);
  }

  @EventPattern(Subjects.FriendRemoved)
  async handleFriendRemoved(
    @Payload() { currentId, receiverId }: FriendRemovedEvent,
    @Ctx() context: RmqContext,
  ): Promise<void> {
    this.friendService.removeFriend(currentId, receiverId);
    this.socketService.removeFriend(currentId, receiverId);
    this.rmqService.ack(context);
  }

  @EventPattern(Subjects.RequestAdded)
  handleRequestAdded(
    @Payload() { receiverId, request }: RequestAddedEvent,
    @Ctx() context: RmqContext,
  ): void {
    this.socketService.addRequest(receiverId, request);
    this.rmqService.ack(context);
  }
}
