// noinspection TypeScriptValidateJSTypes

import { Test, TestingModule } from '@nestjs/testing';
import { MessagesService } from './messages.service';
import { User } from '../users/entities/user.entity';
import { Chat } from '../chats/entities/chat.entity';
import { ConfigService } from '@nestjs/config';
import { FilesService } from '../files/file.service';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { Message } from './entities/message.entity';
import { getMockUser } from '../users/mocks/user.mock';
import { getMockChat } from '../chats/mocks/chat.mock';
import { getRandomString } from '../common/utils/faker';
import { fileMock } from '../users/mocks/file.mock';
import { BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { getMockMessage } from './mock/message.mock';
import { Attachment } from './entities/attachment.entity';

describe('MessagesService', () => {
  let service: MessagesService;
  let fileService: FilesService;
  let current: User;
  let message: Message;
  let chat: Chat;

  const userRepository = {
    findOne: jest.fn(),
  };

  const chatRepository = {
    findOne: jest.fn(),
  };

  const messageRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    persistAndFlush: jest.fn(),
    flush: jest.fn(),
    nativeDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigService,
        MessagesService,
        FilesService,
        {
          provide: getRepositoryToken(User),
          useValue: userRepository,
        },
        {
          provide: getRepositoryToken(Chat),
          useValue: chatRepository,
        },
        {
          provide: getRepositoryToken(Message),
          useValue: messageRepository,
        },
      ],
    }).compile();

    service = module.get<MessagesService>(MessagesService);
    fileService = module.get<FilesService>(FilesService);
    current = getMockUser();
    chat = getMockChat();
    message = getMockMessage();
  });

  describe('CreateMessage', () => {
    it('should successfully create the text message and return true', async () => {
      userRepository.findOne = jest.fn().mockReturnValue(current);
      chatRepository.findOne = jest.fn().mockReturnValue(chat);

      jest.spyOn(chat.members, 'contains').mockReturnValueOnce(true);
      const uploadSpy = jest
        .spyOn(fileService, 'uploadImage')
        .mockReturnValue(Promise.resolve('image-url.png'));

      const text = getRandomString();
      const response = await service.createMessage(current.id, chat.id, { text });
      expect(response).toBeTruthy();
      expect(uploadSpy).not.toHaveBeenCalled();
    });

    it('should successfully create the image message and return true', async () => {
      userRepository.findOne = jest.fn().mockReturnValue(current);
      chatRepository.findOne = jest.fn().mockReturnValue(chat);

      jest.spyOn(chat.members, 'contains').mockReturnValueOnce(true);
      const uploadSpy = jest
        .spyOn(fileService, 'uploadImage')
        .mockReturnValue(Promise.resolve('image-url.png'));

      jest.spyOn(fileService, 'formatName').mockReturnValue('image');

      const file = { ...fileMock };
      const response = await service.createMessage(current.id, chat.id, { text: null }, file);
      expect(response).toBeTruthy();
      expect(uploadSpy).toHaveBeenCalled();
    });

    it('should throw a NotFoundException if the chat cannot be found', async () => {
      userRepository.findOne = jest.fn().mockReturnValue(current);
      chatRepository.findOne = jest.fn().mockReturnValue(null);

      expect(
        async () => await service.createMessage(current.id, chat.id, { text: 'Text' }),
      ).rejects.toThrow(new NotFoundException());

      expect(userRepository.findOne).not.toHaveBeenCalled();
    });

    it('should throw a NotFoundException if the user cannot be found', () => {
      userRepository.findOne = jest.fn().mockReturnValue(null);
      chatRepository.findOne = jest.fn().mockReturnValue(chat);

      expect(
        async () => await service.createMessage(current.id, chat.id, { text: 'Text' }),
      ).rejects.toThrow(new NotFoundException());
    });

    it('should throw an UnauthorizedException if the user is not a member of the chat', () => {
      userRepository.findOne = jest.fn().mockReturnValue(current);
      chatRepository.findOne = jest.fn().mockReturnValue(chat);

      jest.spyOn(chat.members, 'contains').mockReturnValueOnce(false);

      expect(
        async () => await service.createMessage(current.id, chat.id, { text: 'Text' }),
      ).rejects.toThrow(new UnauthorizedException());
    });

    it('should throw an BadRequestException if neither text nor a file are provided', () => {
      userRepository.findOne = jest.fn().mockReturnValue(current);
      chatRepository.findOne = jest.fn().mockReturnValue(chat);

      jest.spyOn(chat.members, 'contains').mockReturnValueOnce(true);

      expect(
        async () => await service.createMessage(current.id, chat.id, { text: null }),
      ).rejects.toThrow(
        new BadRequestException({ message: 'Either a message or a file is required' }),
      );
    });
  });

  describe('GetMessages', () => {
    it('should successfully return a list of messages for the given chat', async () => {
      const messages: Message[] = [];
      for (let i = 0; i < 5; i++) {
        const message = new Message(current);
        message.text = 'Hello World';
        messages.push(message);
      }

      userRepository.findOne = jest.fn().mockReturnValue(current);
      chatRepository.findOne = jest.fn().mockReturnValue(chat);
      messageRepository.find = jest.fn().mockReturnValue(messages);

      jest.spyOn(chat.members, 'contains').mockReturnValueOnce(true);

      const response = await service.getMessages(current.id, chat.id);
      expect(response.length).toEqual(5);
    });

    it('should throw a NotFoundException if the user cannot be found', () => {
      chatRepository.findOne = jest.fn().mockReturnValue(chat);
      userRepository.findOne = jest.fn().mockReturnValueOnce(null);

      expect(async () => await service.getMessages(current.id, chat.id)).rejects.toThrow(
        new NotFoundException(),
      );

      expect(chatRepository.findOne).not.toHaveBeenCalled();
    });

    it('should throw a NotFoundException if the chat cannot be found', () => {
      chatRepository.findOne = jest.fn().mockReturnValue(null);
      userRepository.findOne = jest.fn().mockReturnValueOnce(current);

      expect(async () => await service.getMessages(current.id, chat.id)).rejects.toThrow(
        new NotFoundException(),
      );
    });

    it('should throw an UnauthorizedException if the user is not a member of the chat', () => {
      userRepository.findOne = jest.fn().mockReturnValue(current);
      chatRepository.findOne = jest.fn().mockReturnValue(chat);
      messageRepository.find = jest.fn().mockReturnValue([]);

      jest.spyOn(chat.members, 'contains').mockReturnValueOnce(false);

      expect(async () => await service.getMessages(current.id, chat.id)).rejects.toThrow(
        new UnauthorizedException(),
      );
      expect(messageRepository.find).not.toHaveBeenCalled();
    });
  });

  describe('UpdateMessage', () => {
    it('should successfully update the message and return true', async () => {
      message.user = current;
      messageRepository.findOne = jest.fn().mockReturnValue(message);

      const response = await service.updateMessage(current.id, message.id, { text: 'New Text' });
      expect(response).toBeTruthy();
    });

    it('should throw a NotFoundException if the message cannot be found', () => {
      messageRepository.findOne = jest.fn().mockReturnValue(null);

      expect(
        async () => await service.updateMessage(current.id, message.id, { text: 'New Text' }),
      ).rejects.toThrow(new NotFoundException());
    });

    it('should throw an UnauthorizedException if the user is not a message author', () => {
      messageRepository.findOne = jest.fn().mockReturnValue(message);

      expect(
        async () => await service.updateMessage(current.id, message.id, { text: 'New Text' }),
      ).rejects.toThrow(new UnauthorizedException());
    });
  });

  describe('DeleteMessage', () => {
    it('should successfully delete the message and return true', async () => {
      message.user = current;
      messageRepository.findOne = jest.fn().mockReturnValue(message);

      const response = await service.deleteMessage(current.id, message.id);
      expect(response).toBeTruthy();
    });

    it('should successfully delete the message and the attachment and return true', async () => {
      message.user = current;
      message.attachment = new Attachment('', '', '', message);
      messageRepository.findOne = jest.fn().mockReturnValue(message);

      const deleteSpy = jest.spyOn(fileService, 'deleteFile').mockReturnValue(Promise.resolve());

      const response = await service.deleteMessage(current.id, message.id);
      expect(response).toBeTruthy();
      expect(deleteSpy).toHaveBeenCalled();
    });

    it('should throw a NotFoundException if the message cannot be found', () => {
      messageRepository.findOne = jest.fn().mockReturnValue(null);
      expect(async () => await service.deleteMessage(current.id, message.id)).rejects.toThrow(
        new NotFoundException(),
      );
    });

    it('should throw an UnauthorizedException if the user is not a message author', () => {
      messageRepository.findOne = jest.fn().mockReturnValue(message);
      expect(async () => await service.deleteMessage(current.id, message.id)).rejects.toThrow(
        new UnauthorizedException(),
      );
    });
  });
});
