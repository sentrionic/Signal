import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { User } from '../users/entities/user.entity';
import { EntityRepository } from '@mikro-orm/core';
import { Group } from './entities/group.entity';
import { Chat } from '../chats/entities/chat.entity';
import { ChatType } from '../chats/entities/chat-type.enum';
import { ChatResponse } from '../chats/dto/chat.response';
import { ChatMember } from '../chats/entities/member.entity';
import {
  ChatMembersAddedEvent,
  GroupMemberAddedEvent,
  GroupMemberJoinedEvent,
  GroupMemberRemovedEvent,
  Services,
  Subjects,
} from '@senorg/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(User)
    private userRepository: EntityRepository<User>,
    @InjectRepository(Chat)
    private chatRepository: EntityRepository<Chat>,
    @InjectRepository(ChatMember)
    private memberRepository: EntityRepository<ChatMember>,
    @Inject(Services.Notification)
    private readonly notificationClient: ClientProxy,
  ) {}

  async createGroupChat(currentId: string, name: string, ids: string[]): Promise<ChatResponse> {
    const chat = new Chat(ChatType.GROUP_CHAT);
    chat.group = new Group(name);

    const users = await this.userRepository.find({ id: { $in: [...ids, currentId] } });

    users.forEach((u) => {
      if (u.id === currentId) return;
      const member = new ChatMember(u, chat);
      chat.members.add(member);
    });

    const current = users.find((u) => u.id === currentId);
    if (!current) throw new NotFoundException();

    const currentMember = new ChatMember(current, chat);
    chat.members.add(currentMember);

    await this.chatRepository.persistAndFlush(chat);

    this.notificationClient.emit(
      Subjects.ChatMembersAdded,
      new ChatMembersAddedEvent(
        chat.members.getItems().map((m) => m.user.id),
        chat.id,
      ),
    );

    return chat.toChatResponse(currentMember);
  }

  async addUserToGroup(currentId: string, username: string, chatId: string): Promise<boolean> {
    const chat = await this.chatRepository.findOne(
      { id: chatId },
      { populate: ['members.user', 'messages', 'group'] },
    );

    if (!chat) {
      throw new NotFoundException();
    }

    if (chat.type == ChatType.DIRECT_CHAT) {
      throw new BadRequestException({ message: 'Cannot add another user to a direct chat' });
    }

    if (!this.isChatMember(chat, currentId)) {
      throw new UnauthorizedException();
    }

    const member = await this.userRepository.findOne({ username });

    if (!member) {
      throw new NotFoundException();
    }

    if (this.isChatMember(chat, member.id)) {
      throw new BadRequestException({ message: 'This user is already a member' });
    }

    const chatMember = new ChatMember(member, chat);

    await this.memberRepository.persistAndFlush(chatMember);

    this.notificationClient.emit(
      Subjects.ChatMembersAdded,
      new ChatMembersAddedEvent([member.id], chat.id),
    );

    this.notificationClient.emit(
      Subjects.GroupMemberAdded,
      new GroupMemberAddedEvent(chat.id, member.toUserResponse()),
    );

    this.notificationClient.emit(
      Subjects.GroupMemberJoined,
      new GroupMemberJoinedEvent(member.id, chat.toChatResponse(chatMember)),
    );

    return true;
  }

  async leaveGroup(currentId: string, chatId: string): Promise<boolean> {
    const current = this.userRepository.getReference(currentId);
    const chat = await this.chatRepository.findOne({ id: chatId });

    if (!chat) {
      throw new NotFoundException();
    }

    if (chat.type === ChatType.DIRECT_CHAT) {
      throw new BadRequestException({ message: 'Cannot leave a direct chat' });
    }

    await this.memberRepository.nativeDelete({ user: { id: current.id }, chat: { id: chat.id } });

    this.notificationClient.emit(
      Subjects.GroupMemberRemoved,
      new GroupMemberRemovedEvent(chat.id, currentId),
    );

    return true;
  }

  private isChatMember(chat: Chat, id: string): boolean {
    return chat.members.getItems().some((m) => m.user.id === id);
  }
}
