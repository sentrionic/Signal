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
import { Attachment } from './entities/attachment.entity';
import { BufferFile } from '../common/types/buffer.file';
import { FilesService } from '../files/file.service';
import { MessageResponse } from './dto/message.response';
import { MessageType } from './entities/message-type.enum';
import { SocketService } from '../socket/socket.service';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(User)
    private userRepository: EntityRepository<User>,
    @InjectRepository(Message)
    private messageRepository: EntityRepository<Message>,
    @InjectRepository(Chat)
    private chatRepository: EntityRepository<Chat>,
    private filesService: FilesService,
    private readonly socketService: SocketService,
  ) {}

  async createMessage(
    userId: string,
    chatId: string,
    input: CreateMessageDto,
    file?: BufferFile,
  ): Promise<boolean> {
    const chat = await this.chatRepository.findOne({ id: chatId }, { populate: ['members.user'] });

    if (!chat) {
      throw new NotFoundException();
    }

    const user = await this.userRepository.findOne({ id: userId });

    if (!user) {
      throw new NotFoundException();
    }

    if (!this.isChatMember(chat, user.id)) {
      throw new UnauthorizedException();
    }

    const text = input.text;

    if (!file && !text) {
      throw new BadRequestException({ message: 'Either a message or a file is required' });
    }

    const message = new Message(user, chat);

    if (file) {
      const { originalname, mimetype } = await file;
      const filename = this.filesService.formatName(originalname);
      const directory = `channels/${chatId}`;
      const url = await this.filesService.uploadImage(directory, filename, file);
      message.attachment = new Attachment(url, mimetype, filename, message);
      message.type = MessageType.IMAGE;
    } else if (text) {
      message.text = text;
    }

    await this.messageRepository.persistAndFlush(message);

    this.socketService.sendMessage(chatId, message.toResponse());

    return true;
  }

  async getMessages(
    userId: string,
    id: string,
    cursor?: string | null,
  ): Promise<MessageResponse[]> {
    const user = await this.userRepository.findOne({ id: userId });

    if (!user) {
      throw new NotFoundException();
    }

    const chat = await this.chatRepository.findOne({ id }, { populate: ['members.user'] });

    if (!chat) {
      throw new NotFoundException();
    }

    if (!this.isChatMember(chat, user.id)) {
      throw new UnauthorizedException();
    }

    const query: Record<string, unknown> = {
      chat: { id },
    };

    if (cursor) {
      const date = new Date(cursor);
      if (date.toString() === 'Invalid Date')
        throw new BadRequestException({ message: 'Not a valid cursor' });
      query.sentAt = { $lt: date };
    }

    const messages = await this.messageRepository.find(query, {
      populate: ['user', 'attachment'],
      limit: 35,
      orderBy: [{ sentAt: 'DESC' }],
    });

    return messages.map((m) => m.toResponse());
  }

  async updateMessage(userId: string, id: string, input: UpdateMessageDto): Promise<boolean> {
    const message = await this.messageRepository.findOne({ id }, { populate: ['user'] });

    if (!message) {
      throw new NotFoundException();
    }

    if (message.user.id !== userId) {
      throw new UnauthorizedException();
    }

    message.text = input.text;
    message.updatedAt = new Date();

    await this.messageRepository.flush();

    this.socketService.editMessage(message.chat.id, message.toResponse());

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
      await this.filesService.deleteFile(message.attachment.url);
    }

    await this.messageRepository.nativeDelete({ id });

    this.socketService.deleteMessage(message.chat.id, id);

    return true;
  }

  private isChatMember(chat: Chat, id: string): boolean {
    return chat.members.getItems().some((m) => m.user.id === id);
  }
}
