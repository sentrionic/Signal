import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { User } from '../users/entities/user.entity';
import { EntityRepository } from '@mikro-orm/core';
import { Chat } from './entities/chat.entity';
import { ChatResponse } from './dto/chat.response';

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(User)
    private userRepository: EntityRepository<User>,
    @InjectRepository(Chat)
    private chatRepository: EntityRepository<Chat>,
  ) {}

  async getUserChats(currentID: string): Promise<ChatResponse[]> {
    const chats = await this.chatRepository.find({ members: { id: currentID } });

    const response: ChatResponse[] = [];

    for (const c of chats) {
      const chat = await this.chatRepository.findOne({ id: c.id }, { populate: ['members'] });

      if (!chat) {
        throw new NotFoundException();
      }

      const contact = chat.members.getItems().filter((m) => m.id !== currentID)[0];
      response.push(c.toChatResponse(contact.toUserResponse()));
    }

    return response;
  }

  async getOrCreateChat(currentID: string, contactID: string): Promise<ChatResponse> {
    const chat = await this.chatRepository.findOne(
      {
        members: { id: { $in: [currentID, contactID] } },
      },
      { populate: ['members'] },
    );

    if (chat) {
      const contact = chat.members.getItems().filter((m) => m.id !== currentID)[0];
      return chat.toChatResponse(contact.toUserResponse());
    }

    const current = await this.userRepository.findOne({ id: currentID });

    if (!current) {
      throw new NotFoundException();
    }

    const contact = await this.userRepository.findOne({ id: contactID });

    if (!contact) {
      throw new NotFoundException();
    }

    const newChat = new Chat();
    newChat.members.add(current);
    newChat.members.add(contact);

    await this.chatRepository.persistAndFlush(newChat);

    return newChat.toChatResponse(contact.toUserResponse());
  }
}
