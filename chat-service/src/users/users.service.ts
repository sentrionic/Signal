import { EntityRepository, LockMode } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { UserCreatedEvent, UserUpdatedEvent } from '@senorg/common';
import { ChatMember } from '../chats/entities/member.entity';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: EntityRepository<User>,
    @InjectRepository(ChatMember)
    private memberRepository: EntityRepository<ChatMember>,
  ) {}

  private readonly logger = new Logger(UsersService.name);

  async insertUser(event: UserCreatedEvent): Promise<void> {
    const user = new User(event.id, event.username, event.bio, event.displayName, event.image);
    await this.userRepository.persistAndFlush(user);
  }

  async updateUser(event: UserUpdatedEvent): Promise<void> {
    const user = await this.userRepository.findOne(
      { id: event.id },
      { lockMode: LockMode.OPTIMISTIC, lockVersion: event.version - 1 },
    );

    if (!user) {
      throw new NotFoundException();
    }

    user.bio = event.bio;
    user.username = event.username;
    user.displayName = event.displayName;
    user.image = event.image;

    try {
      await this.userRepository.flush();
    } catch (err) {
      this.logger.error(err);
    }
  }

  async updateLastSeen(userId: string, chatId: string): Promise<void> {
    const member = await this.memberRepository.findOne({
      user: { id: userId },
      chat: { id: chatId },
    });

    if (!member) {
      throw new NotFoundException();
    }

    member.lastSeen = new Date();
    await this.memberRepository.flush();
  }

  async updateLastOnline(userId: string): Promise<void> {
    const user = await this.userRepository.findOne({ id: userId });

    if (!user) {
      throw new NotFoundException();
    }

    user.lastOnline = new Date();

    await this.userRepository.flush();
  }
}
