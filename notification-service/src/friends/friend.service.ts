import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { UserResponse } from '@senorg/common';
import { User } from './entities/user.entity';

@Injectable()
export class FriendService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
  ) {}

  async addUser(data: UserResponse): Promise<void> {
    const user = new User(data.id);
    await this.userRepository.persistAndFlush(user);
  }

  async insertFriend(current: UserResponse, friend: UserResponse): Promise<void> {
    const [user1, user2] = await Promise.all([
      await this.userRepository.findOne({ id: current.id }),
      await this.userRepository.findOne({ id: friend.id }),
    ]);

    if (!user1 || !user2) throw new NotFoundException();

    user1.friends.add(user2);
    user2.friends.add(user1);

    await this.userRepository.flush();
  }

  async removeFriend(id1: string, id2: string): Promise<void> {
    const [user1, user2] = await Promise.all([
      await this.userRepository.findOne({ id: id1 }),
      await this.userRepository.findOne({ id: id2 }),
    ]);

    if (!user1 || !user2) throw new NotFoundException();

    user1.friends.remove(user2);
    user2.friends.remove(user1);

    await this.userRepository.flush();
  }
}
