// noinspection TypeScriptValidateJSTypes

import { Test, TestingModule } from '@nestjs/testing';
import { GroupsService } from './groups.service';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { User } from '../users/entities/user.entity';
import { Group } from './entities/group.entity';
import { getMockGroup } from './mock/group.mock';
import { getMockUser } from '../users/mocks/user.mock';
import { Collection } from '@mikro-orm/core';
import { validate } from 'uuid';
import { BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Chat } from '../chats/entities/chat.entity';
import { getMockChat, getMockGroupChat } from '../chats/mocks/chat.mock';
import { ChatMember } from '../chats/entities/member.entity';
import { Services, Subjects } from '@senorg/common';

describe('GroupsService', () => {
  let service: GroupsService;
  let current: User;
  let group: Group;
  let chat: Chat;

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

  const memberRepository = {
    persistAndFlush: jest.fn(),
    nativeDelete: jest.fn(),
  };

  const notificationClient = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupsService,
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
        {
          provide: getRepositoryToken(ChatMember),
          useValue: memberRepository,
        },
        {
          provide: Services.Notification,
          useValue: notificationClient,
        },
      ],
    }).compile();

    service = module.get<GroupsService>(GroupsService);
    current = getMockUser();
    chat = getMockGroupChat();
    group = getMockGroup();
    chat.group = group;
    notificationClient.emit = jest.fn();
  });

  it('should confirm the test setup works', () => {
    expect(service).toBeDefined();
  });

  describe('CreateGroupChat', () => {
    it('should successfully create and return the group', async () => {
      const users: User[] = [current];
      for (let i = 0; i < 3; i++) {
        const user = getMockUser();
        users.push(user);
      }

      userRepository.find = jest.fn().mockReturnValue(users);
      jest.spyOn(Collection.prototype, 'add').mockReturnValue();
      const clientSpy = jest.spyOn(notificationClient, 'emit');

      const response = await service.createGroupChat(current.id, 'name', []);
      expect(response.id).toBeDefined();

      expect(validate(response.id)).toBeTruthy();

      // Confirm the right event got emitted
      expect(clientSpy).toHaveBeenCalled();
      expect(clientSpy.mock.calls[0][0]).toBe(Subjects.ChatMembersAdded);
    });
  });

  describe('AddUserToGroup', () => {
    it('should successfully add the user to the group', async () => {
      const member = getMockUser();

      userRepository.getReference = jest.fn().mockReturnValue(current);
      userRepository.findOne = jest.fn().mockReturnValue(member);
      chatRepository.findOne = jest.fn().mockReturnValue(chat);

      jest.spyOn(chat.members, 'getItems').mockReturnValue([new ChatMember(current, chat)]);
      jest.spyOn(chat.members, 'add').mockReturnValue();
      const clientSpy = jest.spyOn(notificationClient, 'emit');

      const response = await service.addUserToGroup(current.id, member.username, chat.id);
      expect(response).toBeTruthy();

      // Confirm the right event got emitted
      expect(clientSpy).toHaveBeenCalled();
      expect(clientSpy.mock.calls[0][0]).toBe(Subjects.ChatMembersAdded);
      expect(clientSpy.mock.calls[1][0]).toBe(Subjects.GroupMemberAdded);
      expect(clientSpy.mock.calls[2][0]).toBe(Subjects.GroupMemberJoined);
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

      jest.spyOn(chat.members, 'getItems').mockReturnValue([new ChatMember(current, chat)]);

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

      jest
        .spyOn(chat.members, 'getItems')
        .mockReturnValue([new ChatMember(current, chat), new ChatMember(member, chat)]);

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
      const clientSpy = jest.spyOn(notificationClient, 'emit');

      const response = await service.leaveGroup(current.id, chat.id);
      expect(response).toBeTruthy();

      // Confirm the right event got emitted
      expect(clientSpy).toHaveBeenCalled();
      expect(clientSpy.mock.calls[0][0]).toBe(Subjects.GroupMemberRemoved);
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
