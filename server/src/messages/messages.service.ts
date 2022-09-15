import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { InjectRepository } from '@mikro-orm/nestjs';
import { User } from '../users/entities/user.entity';
import { EntityRepository } from '@mikro-orm/core';
import { Message } from './entities/message.entity';
import { Chat } from '../chats/entities/chat.entity';
import { Group } from '../groups/entities/group.entity';
import { Attachment } from './entities/attachment.entity';
import { BufferFile } from '../common/types/buffer.file';
import { FilesService } from '../files/file.service';
import { MessageResponse } from './dto/message.response';
import { MessageType } from './entities/message-type.enum';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(User)
    private userRepository: EntityRepository<User>,
    @InjectRepository(Message)
    private messageRepository: EntityRepository<Message>,
    @InjectRepository(Chat)
    private chatRepository: EntityRepository<Chat>,
    @InjectRepository(Group)
    private groupRepository: EntityRepository<Group>,
    @InjectRepository(Attachment)
    private attachmentRepository: EntityRepository<Attachment>,
    private filesService: FilesService,
  ) {}

  async createChatMessage(
    userId: string,
    chatId: string,
    input: CreateMessageDto,
    file?: BufferFile,
  ): Promise<boolean> {
    const chat = await this.chatRepository.findOne({ id: chatId }, { populate: ['members'] });

    if (!chat) {
      throw new NotFoundException();
    }

    const user = await this.userRepository.findOne({ id: userId });

    if (!user) {
      throw new NotFoundException();
    }

    if (!chat.members.contains(user)) {
      throw new UnauthorizedException();
    }

    const text = input.text;

    if (!file && !text) {
      throw new BadRequestException({ message: 'Either a message or a file is required' });
    }

    const message = new Message(user);
    message.chat = chat;

    if (file) {
      const { originalname, mimetype } = await file;
      const filename = this.filesService.formatName(originalname);
      const directory = `channels/${chatId}`;
      const url = await this.filesService.uploadImage(directory, filename, file);
      const attachment = new Attachment(url, mimetype, filename, message);
      await this.attachmentRepository.persistAndFlush(attachment);
      message.attachment = attachment;
      message.type = MessageType.IMAGE;
    } else if (text) {
      message.text = text;
    }

    await this.messageRepository.persistAndFlush(message);

    return true;
  }

  async createGroupMessage(
    userId: string,
    groupId: string,
    input: CreateMessageDto,
    file?: BufferFile,
  ): Promise<boolean> {
    const group = await this.groupRepository.findOne({ id: groupId }, { populate: ['members'] });

    if (!group) {
      throw new NotFoundException();
    }

    const user = await this.userRepository.findOne({ id: userId });

    if (!user) {
      throw new NotFoundException();
    }

    if (!group.members.contains(user)) {
      throw new UnauthorizedException();
    }

    const text = input.text;

    if (!file && !text) {
      throw new BadRequestException({ message: 'Either a message or a file is required' });
    }

    const message = new Message(user);
    message.group = group;

    if (file) {
      const { originalname, mimetype } = await file;
      const filename = this.filesService.formatName(originalname);
      const directory = `channels/${groupId}`;
      const url = await this.filesService.uploadImage(directory, filename, file);
      const attachment = new Attachment(url, mimetype, filename, message);
      await this.attachmentRepository.persistAndFlush(attachment);
      message.attachment = attachment;
      message.type = MessageType.IMAGE;
    } else if (text) {
      message.text = text;
    }

    await this.messageRepository.persistAndFlush(message);

    return true;
  }

  async getGroupMessages(
    userId: string,
    id: string,
    cursor?: string | null,
  ): Promise<MessageResponse[]> {
    const user = await this.userRepository.findOne({ id: userId });

    if (!user) {
      throw new NotFoundException();
    }

    const group = await this.groupRepository.findOne({ id }, { populate: ['members'] });

    if (!group) {
      throw new NotFoundException();
    }

    if (!group.members.contains(user)) {
      throw new UnauthorizedException();
    }

    const query: Record<string, unknown> = {
      group: { id },
    };

    if (cursor) {
      query.sentAt = { $lt: new Date(cursor) };
    }

    const messages = await this.messageRepository.find(query, {
      populate: ['user', 'attachment'],
      limit: 35,
      orderBy: [{ sentAt: 'DESC' }],
    });

    return messages.map((m) => m.toResponse());
  }

  async getChatMessages(
    userId: string,
    id: string,
    cursor?: string | null,
  ): Promise<MessageResponse[]> {
    const user = await this.userRepository.findOne({ id: userId });

    if (!user) {
      throw new NotFoundException();
    }

    const chat = await this.chatRepository.findOne({ id }, { populate: ['members'] });

    if (!chat) {
      throw new NotFoundException();
    }

    if (!chat.members.contains(user)) {
      throw new UnauthorizedException();
    }

    const query: Record<string, unknown> = {
      chat: { id },
    };

    if (cursor) {
      query.sentAt = { $lt: new Date(cursor) };
    }

    const messages = await this.messageRepository.find(query, {
      populate: ['user', 'attachment'],
      limit: 35,
      orderBy: [{ sentAt: 'DESC' }],
    });

    return messages.map((m) => m.toResponse());
  }

  async updateMessage(userId: string, id: string, input: UpdateMessageDto): Promise<boolean> {
    const message = await this.messageRepository.findOne({ id });

    if (!message) {
      throw new NotFoundException();
    }

    if (message.user.id !== userId) {
      throw new UnauthorizedException();
    }

    message.text = input.text;

    await this.messageRepository.flush();

    return true;
  }

  async deleteMessage(userId: string, id: string): Promise<boolean> {
    const message = await this.messageRepository.findOne(
      { id },
      { populate: ['user', 'attachment'] },
    );

    if (!message) {
      throw new NotFoundException();
    }

    if (message.user.id !== userId) {
      throw new UnauthorizedException();
    }

    if (message.attachment) {
      await this.attachmentRepository.nativeDelete({ id: message.attachment.id });
      await this.filesService.deleteFile(message.attachment.url);
    }

    await this.messageRepository.nativeDelete({ id });

    return true;
  }
}
