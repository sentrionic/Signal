import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { User } from '../users/entities/user.entity';
import { EntityRepository } from '@mikro-orm/core';
import { UserResponse } from '../users/dto/user.response';
import { RequestResponse } from './dto/request.response';
import { RequestType } from './entities/request.enum';
import {
  FriendAddedEvent,
  FriendRemovedEvent,
  RequestAddedEvent,
  Services,
  Subjects,
} from '@senorg/common';
import { ClientProxy } from '@nestjs/microservices';

type Associations = ('incomingRequests' | 'outgoingRequests' | 'friends')[];

@Injectable()
export class FriendsService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
    @Inject(Services.Notification)
    private readonly notificationClient: ClientProxy,
  ) {}

  async addFriendRequest(currentId: string, username: string): Promise<boolean> {
    const [current, receiver] = await Promise.all([
      this.getUserById(currentId, ['incomingRequests', 'outgoingRequests', 'friends']),
      this.userRepository.findOne(
        { username },
        {
          populate: ['outgoingRequests', 'friends'],
        },
      ),
    ]);

    if (!receiver) {
      throw new NotFoundException();
    }

    if (currentId === receiver.id) {
      throw new BadRequestException({ message: 'You cannot add yourself' });
    }

    if (current.friends.contains(receiver)) {
      throw new BadRequestException({
        message: 'You are already friends with that person',
      });
    }

    // If there is an incoming request already, accept it
    if (current.incomingRequests.contains(receiver)) {
      current.incomingRequests.remove(receiver);
      current.friends.add(receiver);
      receiver.friends.add(current);

      await this.userRepository.flush();

      this.notificationClient.emit(
        Subjects.FriendAdded,
        new FriendAddedEvent(current.toUserResponse(), receiver.toUserResponse()),
      );

      return true;
    }

    current.outgoingRequests.add(receiver);

    await this.userRepository.flush();

    this.notificationClient.emit(
      Subjects.RequestAdded,
      new RequestAddedEvent(receiver.id, {
        user: current.toUserResponse(),
        type: RequestType.INCOMING,
      }),
    );

    return true;
  }

  async acceptFriendRequest(currentId: string, receiverId: string): Promise<boolean> {
    if (currentId === receiverId) {
      throw new BadRequestException({ message: 'You cannot accept yourself' });
    }

    const [current, receiver] = await Promise.all([
      this.getUserById(currentId, ['incomingRequests', 'friends']),
      this.getUserById(receiverId, ['outgoingRequests', 'friends']),
    ]);

    if (current.incomingRequests.contains(receiver)) {
      current.incomingRequests.remove(receiver);
      current.friends.add(receiver);
      receiver.friends.add(current);

      await this.userRepository.flush();

      this.notificationClient.emit(
        Subjects.FriendAdded,
        new FriendAddedEvent(current.toUserResponse(), receiver.toUserResponse()),
      );

      return true;
    }

    return false;
  }

  async removeFriendRequest(currentId: string, receiverId: string): Promise<boolean> {
    if (currentId === receiverId) {
      throw new BadRequestException({ message: 'You cannot remove yourself' });
    }

    const [current, receiver] = await Promise.all([
      this.getUserById(currentId, ['incomingRequests', 'outgoingRequests']),
      this.getUserById(receiverId, ['outgoingRequests']),
    ]);

    if (current.incomingRequests.contains(receiver)) {
      current.incomingRequests.remove(receiver);
      await this.userRepository.flush();
    } else if (current.outgoingRequests.contains(receiver)) {
      current.outgoingRequests.remove(receiver);
      await this.userRepository.flush();
    }

    return true;
  }

  async getFriendRequests(currentId: string): Promise<RequestResponse[]> {
    const user = await this.getUserById(currentId, ['incomingRequests', 'outgoingRequests']);

    const incoming: RequestResponse[] = user.incomingRequests.getItems().map((r) => ({
      user: r.toUserResponse(),
      type: RequestType.INCOMING,
    }));

    const outgoing: RequestResponse[] = user.outgoingRequests.getItems().map((r) => ({
      user: r.toUserResponse(),
      type: RequestType.OUTGOING,
    }));

    return [...incoming, ...outgoing];
  }

  async getFriends(currentId: string): Promise<UserResponse[]> {
    const user = await this.getUserById(currentId, ['friends']);
    return user.friends.getItems().map((u) => u.toUserResponse());
  }

  async removeFriend(currentId: string, receiverId: string): Promise<boolean> {
    if (currentId === receiverId) {
      throw new BadRequestException({ message: 'You cannot remove yourself' });
    }

    const [current, receiver] = await Promise.all([
      this.getUserById(currentId, ['friends']),
      this.getUserById(receiverId, ['friends']),
    ]);

    if (current.friends.contains(receiver)) {
      current.friends.remove(receiver);
      receiver.friends.remove(current);

      await this.userRepository.flush();

      this.notificationClient.emit(
        Subjects.FriendRemoved,
        new FriendRemovedEvent(receiver.id, current.id),
      );
    }

    return true;
  }

  private async getUserById(id: string, populate: Associations = []): Promise<User> {
    const user = await this.userRepository.findOne({ id }, { populate });

    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }
}
