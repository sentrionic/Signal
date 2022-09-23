import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { User } from '../users/entities/user.entity';
import { Collection, EntityRepository } from '@mikro-orm/core';
import { Chat } from './entities/chat.entity';
import { ChatResponse } from './dto/chat.response';
import { ChatType } from './entities/chat-type.enum';
import { ChatMember } from './entities/member.entity';
import { Message } from '../messages/entities/message.entity';

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(User)
    private userRepository: EntityRepository<User>,
    @InjectRepository(Chat)
    private chatRepository: EntityRepository<Chat>,
    @InjectRepository(Message)
    private readonly messageRepository: EntityRepository<Message>,
  ) {}

  async getUserChats(currentID: string): Promise<ChatResponse[]> {
    const chats = await this.chatRepository.find(
      { members: { user: { id: currentID } } },
      { orderBy: { messages: { sentAt: 'DESC NULLS LAST' } } },
    );

    const response: ChatResponse[] = [];

    for (const c of chats) {
      await this.chatRepository.populate(c, ['members.user', 'group']);
      await this.hydrateWithLastChatMessage(c);

      const current = this.getChatMember(c.members, currentID);

      if (c.type == ChatType.DIRECT_CHAT) {
        // Get the "other" member of the chat
        const contact = c.members.getItems().find((e) => e.user.id !== currentID);
        if (!contact) throw new NotFoundException();
        response.push(c.toChatResponse(current, contact.user.toUserResponse()));
      } else {
        response.push(c.toChatResponse(current));
      }
    }

    return response;
  }

  async getOrCreateChat(currentID: string, contactID: string): Promise<ChatResponse> {
    const chat = await this.chatRepository.findOne(
      {
        members: { user: { id: { $in: [currentID, contactID] } } },
      },
      { populate: ['members.user'] },
    );

    if (chat) {
      await this.hydrateWithLastChatMessage(chat);
      const contact = this.getChatMember(chat.members, contactID);
      const current = this.getChatMember(chat.members, currentID);
      return chat.toChatResponse(current, contact.user.toUserResponse());
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
    const currentMember = new ChatMember(current, newChat);
    const contactMember = new ChatMember(contact, newChat);
    newChat.members.add(currentMember, contactMember);

    await this.chatRepository.persistAndFlush(newChat);

    return newChat.toChatResponse(currentMember, contact.toUserResponse());
  }

  private async hydrateWithLastChatMessage(chat: Chat): Promise<void> {
    const messages = await this.messageRepository.find(
      { chat: { id: chat.id } },
      {
        limit: 1,
        orderBy: { sentAt: 'DESC NULLS LAST' },
      },
    );
    chat.messages.hydrate(messages);
  }

  private getChatMember(members: Collection<ChatMember>, id: string): ChatMember {
    return members.getItems().filter((m) => m.user.id === id)[0];
  }
}
