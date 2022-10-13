// noinspection TypeScriptValidateJSTypes

import { Test, TestingModule } from '@nestjs/testing';
import { ChatsService } from './chats.service';
import { User } from '../users/entities/user.entity';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { Chat } from './entities/chat.entity';
import { getMockUser } from '../users/mocks/user.mock';
import { getMockChat, getMockGroupChat } from './mocks/chat.mock';
import { NotFoundException } from '@nestjs/common';
import { validate } from 'uuid';
import { Collection } from '@mikro-orm/core';
import { ChatMember } from './entities/member.entity';
import { Message } from '../messages/entities/message.entity';
import { getMockMessage } from '../messages/mock/message.mock';
import { Services, Subjects } from '@senorg/common';

describe('ChatsService', () => {
  let service: ChatsService;
  let current: User;

  const userRepository = {
    findOne: jest.fn(),
  };

  const chatRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    persistAndFlush: jest.fn(),
    populate: jest.fn(),
  };

  const messageRepository = {
    find: jest.fn(),
  };

  const notificationClient = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatsService,
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
        {
          provide: Services.Notification,
          useValue: notificationClient,
        },
      ],
    }).compile();

    service = module.get<ChatsService>(ChatsService);
    current = getMockUser();
  });

  describe('GetUserChats', () => {
    it('should successfully return all the chats for the current user', async () => {
      messageRepository.find = jest.fn().mockReturnValue([getMockMessage(), getMockMessage()]);

      const chats: Chat[] = [];
      for (let i = 0; i < 3; i++) {
        const chat = i % 2 == 0 ? getMockChat() : getMockGroupChat();
        const mockContact = getMockUser();
        jest.spyOn(chat.members, 'add').mockReturnValue();
        jest.spyOn(chat.messages, 'hydrate').mockReturnValue();
        jest
          .spyOn(chat.members, 'getItems')
          .mockReturnValue([new ChatMember(current, chat), new ChatMember(mockContact, chat)]);
        chats.push(chat);
      }

      chatRepository.find = jest.fn().mockReturnValue(chats);

      chatRepository.findOne = jest
        .fn()
        .mockReturnValueOnce(chats[0])
        .mockReturnValueOnce(chats[1])
        .mockReturnValueOnce(chats[2]);

      const response = await service.getUserChats(current.id);
      expect(response.length).toEqual(3);
    });
  });

  describe('GetOrCreateChat', () => {
    it('should successfully return the chat between the two users if it already exists', async () => {
      const chat = getMockChat();
      const contact = getMockUser();

      chatRepository.findOne = jest.fn().mockReturnValue(chat);
      jest.spyOn(chat.messages, 'hydrate').mockReturnValue();
      jest
        .spyOn(chat.members, 'getItems')
        .mockReturnValue([new ChatMember(current, chat), new ChatMember(contact, chat)]);

      const clientSpy = jest.spyOn(notificationClient, 'emit');

      const response = await service.getOrCreateChat(current.id, contact.id);
      expect(response.id).toBeDefined();
      expect(response.user).toBeDefined();

      expect(validate(response.id)).toBeTruthy();
      expect(clientSpy).not.toHaveBeenCalled();
    });

    it('should successfully create and return the chat between the two users if it did not exist beforehand', async () => {
      const contact = getMockUser();

      chatRepository.findOne = jest.fn().mockReturnValue(null);
      userRepository.findOne = jest.fn().mockReturnValueOnce(current).mockReturnValueOnce(contact);
      jest.spyOn(Collection.prototype, 'add').mockReturnValue();
      const clientSpy = jest.spyOn(notificationClient, 'emit');

      const response = await service.getOrCreateChat(current.id, contact.id);
      expect(response.id).toBeDefined();
      expect(response.user).toBeDefined();

      expect(validate(response.id)).toBeTruthy();

      // Confirm the right event got emitted
      expect(clientSpy).toHaveBeenCalled();
      expect(clientSpy.mock.calls[0][0]).toBe(Subjects.ChatMembersAdded);
    });

    it('should throw a NotFoundException if the contact cannot be found', async () => {
      const contact = getMockUser();

      chatRepository.findOne = jest.fn().mockReturnValue(null);
      userRepository.findOne = jest.fn().mockReturnValueOnce(current).mockReturnValueOnce(null);

      expect(async () => await service.getOrCreateChat(current.id, contact.id)).rejects.toThrow(
        new NotFoundException(),
      );
    });
  });
});
