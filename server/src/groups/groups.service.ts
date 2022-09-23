import {
  BadRequestException,
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
import { SocketService } from '../socket/socket.service';
import { ChatMember } from '../chats/entities/member.entity';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(User)
    private userRepository: EntityRepository<User>,
    @InjectRepository(Chat)
    private chatRepository: EntityRepository<Chat>,
    @InjectRepository(ChatMember)
    private memberRepository: EntityRepository<ChatMember>,
    private readonly socketService: SocketService,
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

    this.socketService.sendChat(member.id, chat.toChatResponse(chatMember));
    this.socketService.addMember(chat.id, member.toUserResponse());

    return true;
  }

  async leaveGroup(currentId: string, chatId: string): Promise<boolean> {
    const current = await this.userRepository.getReference(currentId);
    const chat = await this.chatRepository.findOne({ id: chatId });

    if (!chat) {
      throw new NotFoundException();
    }

    if (chat.type === ChatType.DIRECT_CHAT) {
      throw new BadRequestException({ message: 'Cannot leave a direct chat' });
    }

    await this.memberRepository.nativeDelete({ user: { id: current.id }, chat: { id: chat.id } });

    this.socketService.removeMember(chat.id, currentId);

    return true;
  }

  private isChatMember(chat: Chat, id: string): boolean {
    return chat.members.getItems().some((m) => m.user.id === id);
  }
}
