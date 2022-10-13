import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '../friends/entities/user.entity';
import { Chat } from './entities/chat.entity';

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(Chat)
    private readonly chatRepository: EntityRepository<Chat>,
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
  ) {}

  async insertChatMember(userIds: string[], chatId: string): Promise<void> {
    const chat = new Chat(chatId);
    const members = await this.userRepository.find({ id: { $in: userIds } });

    for (const member of members) {
      chat.members.add(member);
    }
    await this.chatRepository.persistAndFlush(chat);
  }

  async removeChatMember(userId: string, chatId: string): Promise<void> {
    const [chat, user] = await Promise.all([
      this.chatRepository.findOne({ id: chatId }),
      this.userRepository.findOne({ id: userId }),
    ]);

    if (!chat || !user) throw new NotFoundException();

    chat.members.remove(user);
    await this.chatRepository.flush();
  }
}
