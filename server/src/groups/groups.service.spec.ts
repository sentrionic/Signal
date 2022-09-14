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

describe('GroupsService', () => {
  let service: GroupsService;
  let current: User;
  let group: Group;

  const userRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    getReference: jest.fn(),
  };

  const groupRepository = {
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
          provide: getRepositoryToken(User),
          useValue: userRepository,
        },
        {
          provide: getRepositoryToken(Group),
          useValue: groupRepository,
        },
      ],
    }).compile();

    service = module.get<GroupsService>(GroupsService);
    current = userMock;
    group = getMockGroup();
  });

  describe('GetUserGroups', () => {
    it('should successfully return a list of groups the user is in', async () => {
      const groups: Group[] = [];
      for (let i = 0; i < 3; i++) {
        const group = getMockGroup();
        groups.push(group);
      }

      groupRepository.find = jest.fn().mockReturnValue(groups);

      const response = await service.getUserGroups(current.id);
      expect(response.length).toEqual(3);
    });
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
      groupRepository.findOne = jest.fn().mockReturnValue(group);

      jest.spyOn(group.members, 'contains').mockReturnValueOnce(true).mockReturnValueOnce(false);
      jest.spyOn(group.members, 'add').mockReturnValue();

      const response = await service.addUserToGroup(current.id, member.username, group.id);
      expect(response).toBeTruthy();
    });

    it('should throw a NotFoundException if the group cannot be found', async () => {
      const member = getMockUser();

      userRepository.getReference = jest.fn().mockReturnValue(current);
      userRepository.findOne = jest.fn().mockReturnValue(member);
      groupRepository.findOne = jest.fn().mockReturnValue(null);

      expect(
        async () => await service.addUserToGroup(current.id, member.username, group.id),
      ).rejects.toThrow(new NotFoundException());
    });

    it('should throw a NotFoundException if the user cannot be found', async () => {
      userRepository.getReference = jest.fn().mockReturnValue(current);
      userRepository.findOne = jest.fn().mockReturnValue(null);
      groupRepository.findOne = jest.fn().mockReturnValue(group);

      jest.spyOn(group.members, 'contains').mockReturnValueOnce(true);

      expect(async () => await service.addUserToGroup(current.id, '', group.id)).rejects.toThrow(
        new NotFoundException(),
      );
    });

    it('should throw an UnauthorizedException if the one inviting is not in the group', async () => {
      userRepository.getReference = jest.fn().mockReturnValue(current);
      groupRepository.findOne = jest.fn().mockReturnValue(group);

      jest.spyOn(group.members, 'contains').mockReturnValueOnce(false);

      expect(async () => await service.addUserToGroup(current.id, '', group.id)).rejects.toThrow(
        new UnauthorizedException(),
      );
    });

    it('should throw an BadRequestException if the user is already in the group', async () => {
      const member = getMockUser();

      userRepository.getReference = jest.fn().mockReturnValue(current);
      userRepository.findOne = jest.fn().mockReturnValue(member);
      groupRepository.findOne = jest.fn().mockReturnValue(group);

      jest.spyOn(group.members, 'contains').mockReturnValueOnce(true).mockReturnValueOnce(true);

      expect(
        async () => await service.addUserToGroup(current.id, member.username, group.id),
      ).rejects.toThrow(new BadRequestException({ message: 'This user is already a member' }));
    });
  });

  describe('LeaveGroup', () => {
    it('should successfully remove the user from the group', async () => {
      userRepository.getReference = jest.fn().mockReturnValue(current);
      groupRepository.findOne = jest.fn().mockReturnValue(group);

      jest.spyOn(group.members, 'remove').mockReturnValue();

      const response = await service.leaveGroup(current.id, group.id);
      expect(response).toBeTruthy();
    });

    it('should throw a NotFoundException if the group cannot be found', async () => {
      userRepository.getReference = jest.fn().mockReturnValue(current);
      groupRepository.findOne = jest.fn().mockReturnValue(null);

      expect(async () => await service.leaveGroup(current.id, group.id)).rejects.toThrow(
        new NotFoundException(),
      );
    });
  });
});
