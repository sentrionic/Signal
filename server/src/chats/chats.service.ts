import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { User } from '../users/entities/user.entity';
import { EntityRepository } from '@mikro-orm/core';
import { Chat } from './entities/chat.entity';
import { ChatResponse } from './dto/chat.response';
import { ChatType } from './entities/chat-type.enum';

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(User)
    private userRepository: EntityRepository<User>,
    @InjectRepository(Chat)
    private chatRepository: EntityRepository<Chat>,
  ) {}

  async getUserChats(currentID: string): Promise<ChatResponse[]> {
    const chats = await this.chatRepository.find(
      { members: { id: currentID } },
      { orderBy: { messages: { sentAt: 'DESC NULLS LAST' } } },
    );

    const response: ChatResponse[] = [];

    for (const c of chats) {
      await this.chatRepository.populate(c, ['members', 'group', 'messages']);

      if (c.type == ChatType.DIRECT_CHAT) {
        // Get the "other" member of the chat
        const contact = c.members.getItems().filter((m) => m.id !== currentID)[0];
        response.push(c.toChatResponse(contact.toUserResponse()));
      } else {
        response.push(c.toChatResponse());
      }
    }

    return response;
  }

  async getOrCreateChat(currentID: string, contactID: string): Promise<ChatResponse> {
    const chat = await this.chatRepository.findOne(
      {
        members: { id: { $in: [currentID, contactID] } },
      },
      { populate: ['members', 'messages'] },
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

    const newChat = new Chat(ChatType.DIRECT_CHAT);
    newChat.members.add(current, contact);

    await this.chatRepository.persistAndFlush(newChat);

    return newChat.toChatResponse(contact.toUserResponse());
  }
}
