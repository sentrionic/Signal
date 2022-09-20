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

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(User)
    private userRepository: EntityRepository<User>,
    @InjectRepository(Group)
    private groupRepository: EntityRepository<Group>,
    @InjectRepository(Chat)
    private chatRepository: EntityRepository<Chat>,
    private readonly socketService: SocketService,
  ) {}

  async createGroupChat(current: string, name: string, ids: string[]): Promise<ChatResponse> {
    const chat = new Chat(ChatType.GROUP_CHAT);
    const group = new Group(name);
    chat.group = group;

    const users = await this.userRepository.find({ id: { $in: [...ids, current] } });

    users.forEach((u) => chat.members.add(u));

    await this.groupRepository.persistAndFlush(group);
    await this.chatRepository.persistAndFlush(chat);

    return chat.toChatResponse();
  }

  async addUserToGroup(currentId: string, username: string, chatId: string): Promise<boolean> {
    const current = await this.userRepository.getReference(currentId);
    const chat = await this.chatRepository.findOne(
      { id: chatId },
      { populate: ['members', 'messages', 'group'] },
    );

    if (!chat) {
      throw new NotFoundException();
    }

    if (chat.type == ChatType.DIRECT_CHAT) {
      throw new BadRequestException({ message: 'Cannot add another user to a direct chat' });
    }

    if (!chat.members.contains(current)) {
      throw new UnauthorizedException();
    }

    const member = await this.userRepository.findOne({ username });

    if (!member) {
      throw new NotFoundException();
    }

    if (chat.members.contains(member)) {
      throw new BadRequestException({ message: 'This user is already a member' });
    }

    chat.members.add(member);

    await this.chatRepository.flush();

    this.socketService.sendChat(member.id, chat.toChatResponse());
    this.socketService.addMember(chat.id, member.toUserResponse());

    return true;
  }

  async leaveGroup(currentId: string, chatId: string): Promise<boolean> {
    const current = await this.userRepository.getReference(currentId);
    const chat = await this.chatRepository.findOne({ id: chatId }, { populate: ['members'] });

    if (!chat) {
      throw new NotFoundException();
    }

    if (chat.type === ChatType.DIRECT_CHAT) {
      throw new BadRequestException({ message: 'Cannot leave a direct chat' });
    }

    chat.members.remove(current);

    await this.chatRepository.flush();

    this.socketService.removeMember(chat.id, currentId);

    return true;
  }
}
