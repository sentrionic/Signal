// noinspection TypeScriptValidateJSTypes

import { Test, TestingModule } from '@nestjs/testing';
import { GroupsService } from './groups.service';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { User } from '../users/entities/user.entity';
import { Group } from './entities/group.entity';
import { getMockGroup } from './mock/group.mock';
import { getMockUser, userMock } from '../users/mocks/user.mock';
import { Collection } from '@mikro-orm/core';
import { validate } from 'uuid';
import { BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Chat } from '../chats/entities/chat.entity';
import { getMockChat, getMockGroupChat } from '../chats/mocks/chat.mock';
import { SocketService } from '../socket/socket.service';
import { ConfigService } from '@nestjs/config';
import { mockConfigService } from '../messages/mock/config.service.mock';
import { mockSocketService } from '../messages/mock/socket.service.mock';

describe('GroupsService', () => {
  let service: GroupsService;
  let current: User;
  let group: Group;
  let chat: Chat;
  let socketService: SocketService;

  const userRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    getReference: jest.fn(),
  };

  const groupRepository = {
    persistAndFlush: jest.fn(),
  };

  const chatRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    flush: jest.fn(),
    persistAndFlush: jest.fn(),
    populate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupsService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: SocketService,
          useValue: mockSocketService,
        },
        {
          provide: getRepositoryToken(User),
          useValue: userRepository,
        },
        {
          provide: getRepositoryToken(Group),
          useValue: groupRepository,
        },
        {
          provide: getRepositoryToken(Chat),
          useValue: chatRepository,
        },
      ],
    }).compile();

    service = module.get<GroupsService>(GroupsService);
    socketService = module.get<SocketService>(SocketService);
    current = userMock;
    chat = getMockGroupChat();
    group = getMockGroup();
    chat.group = group;
  });

  it('should confirm the test setup works', () => {
    expect(service).toBeDefined();
  });

  describe('CreateGroupChat', () => {
    it('should successfully create and return the group', async () => {
      const users: User[] = [];
      for (let i = 0; i < 3; i++) {
        const user = getMockUser();
        users.push(user);
      }

      userRepository.find = jest.fn().mockReturnValue(users);
      jest.spyOn(Collection.prototype, 'add').mockReturnValue();

      const response = await service.createGroupChat(current.id, 'name', []);
      expect(response.id).toBeDefined();

      expect(validate(response.id)).toBeTruthy();
    });
  });

  describe('AddUserToGroup', () => {
    it('should successfully add the user to the group', async () => {
      const member = getMockUser();

      userRepository.getReference = jest.fn().mockReturnValue(current);
      userRepository.findOne = jest.fn().mockReturnValue(member);
      chatRepository.findOne = jest.fn().mockReturnValue(chat);

      jest.spyOn(chat.members, 'contains').mockReturnValueOnce(true).mockReturnValueOnce(false);
      jest.spyOn(chat.members, 'add').mockReturnValue();
      const socketSpy = jest.spyOn(socketService, 'addMember').mockReturnValue();
      const socketSpySend = jest.spyOn(socketService, 'sendChat').mockReturnValue();

      const response = await service.addUserToGroup(current.id, member.username, chat.id);
      expect(response).toBeTruthy();
      expect(socketSpy).toHaveBeenCalled();
      expect(socketSpySend).toHaveBeenCalled();
    });

    it('should throw a NotFoundException if the group chat cannot be found', async () => {
      const member = getMockUser();

      userRepository.getReference = jest.fn().mockReturnValue(current);
      userRepository.findOne = jest.fn().mockReturnValue(member);
      chatRepository.findOne = jest.fn().mockReturnValue(null);

      expect(
        async () => await service.addUserToGroup(current.id, member.username, chat.id),
      ).rejects.toThrow(new NotFoundException());
    });

    it('should throw a NotFoundException if the user cannot be found', async () => {
      userRepository.getReference = jest.fn().mockReturnValue(current);
      userRepository.findOne = jest.fn().mockReturnValue(null);
      chatRepository.findOne = jest.fn().mockReturnValue(chat);

      jest.spyOn(chat.members, 'contains').mockReturnValueOnce(true);

      expect(async () => await service.addUserToGroup(current.id, '', chat.id)).rejects.toThrow(
        new NotFoundException(),
      );
    });

    it('should throw an UnauthorizedException if the one inviting is not in the group', async () => {
      userRepository.getReference = jest.fn().mockReturnValue(current);
      chatRepository.findOne = jest.fn().mockReturnValue(chat);

      jest.spyOn(chat.members, 'contains').mockReturnValueOnce(false);

      expect(async () => await service.addUserToGroup(current.id, '', chat.id)).rejects.toThrow(
        new UnauthorizedException(),
      );
    });

    it('should throw an BadRequestException if the user is already in the group chat', async () => {
      const member = getMockUser();

      userRepository.getReference = jest.fn().mockReturnValue(current);
      userRepository.findOne = jest.fn().mockReturnValue(member);
      chatRepository.findOne = jest.fn().mockReturnValue(chat);

      jest.spyOn(chat.members, 'contains').mockReturnValueOnce(true).mockReturnValueOnce(true);

      expect(
        async () => await service.addUserToGroup(current.id, member.username, chat.id),
      ).rejects.toThrow(new BadRequestException({ message: 'This user is already a member' }));
    });

    it('should throw an BadRequestException if the chat is not a group chat', async () => {
      const member = getMockUser();
      const directChat = getMockChat();

      userRepository.getReference = jest.fn().mockReturnValue(current);
      userRepository.findOne = jest.fn().mockReturnValue(member);
      chatRepository.findOne = jest.fn().mockReturnValue(directChat);

      expect(
        async () => await service.addUserToGroup(current.id, member.username, chat.id),
      ).rejects.toThrow(
        new BadRequestException({ message: 'Cannot add another user to a direct chat' }),
      );
    });
  });

  describe('LeaveGroup', () => {
    it('should successfully remove the user from the group', async () => {
      userRepository.getReference = jest.fn().mockReturnValue(current);
      chatRepository.findOne = jest.fn().mockReturnValue(chat);

      jest.spyOn(chat.members, 'remove').mockReturnValue();
      const socketSpy = jest.spyOn(socketService, 'removeMember').mockReturnValue();

      const response = await service.leaveGroup(current.id, chat.id);
      expect(response).toBeTruthy();
      expect(socketSpy).toHaveBeenCalled();
    });

    it('should throw a NotFoundException if the group chat cannot be found', async () => {
      userRepository.getReference = jest.fn().mockReturnValue(current);
      chatRepository.findOne = jest.fn().mockReturnValue(null);

      expect(async () => await service.leaveGroup(current.id, chat.id)).rejects.toThrow(
        new NotFoundException(),
      );
    });

    it('should throw an BadRequestException if the chat is not a group chat', async () => {
      const directChat = getMockChat();
      userRepository.getReference = jest.fn().mockReturnValue(current);
      chatRepository.findOne = jest.fn().mockReturnValue(directChat);

      expect(async () => await service.leaveGroup(current.id, chat.id)).rejects.toThrow(
        new BadRequestException({ message: 'Cannot leave a direct chat' }),
      );
    });
  });
});
