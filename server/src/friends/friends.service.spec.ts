// noinspection TypeScriptValidateJSTypes

import { Test, TestingModule } from '@nestjs/testing';
import { FriendsService } from './friends.service';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { User } from '../users/entities/user.entity';
import { getMockUser } from '../users/mocks/user.mock';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('FriendsService', () => {
  let service: FriendsService;
  let current: User;
  let receiver: User;

  const repository = {
    findOne: jest.fn(),
    flush: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FriendsService,
        {
          provide: getRepositoryToken(User),
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<FriendsService>(FriendsService);

    current = getMockUser();
    receiver = getMockUser();

    repository.findOne = jest.fn().mockReturnValueOnce(current).mockReturnValueOnce(receiver);
  });

  describe('AddFriendRequest', () => {
    it('should return true on successful execution', async () => {
      jest.spyOn(current.outgoingRequests, 'add').mockReturnValue();

      const response = await service.addFriendRequest(current.id, receiver.username);
      expect(response).toBeTruthy();
    });

    it('should throw a BadRequestException if both IDs are equal', async () => {
      repository.findOne = jest.fn().mockReturnValueOnce(current).mockReturnValueOnce(current);
      expect(
        async () => await service.addFriendRequest(current.id, current.username),
      ).rejects.toThrow(new BadRequestException({ message: 'You cannot add yourself' }));
    });

    it('should throw a BadRequestException if both users are already friends', async () => {
      jest.spyOn(current.friends, 'contains').mockReturnValue(true);

      expect(
        async () => await service.addFriendRequest(current.id, receiver.username),
      ).rejects.toThrow(
        new BadRequestException({ message: 'You are already friends with that person' }),
      );
    });

    it('should should add both users as friends if there is already an incoming request from a user that the current user is trying to add', async () => {
      jest.spyOn(current.incomingRequests, 'contains').mockReturnValue(true);
      jest.spyOn(current.incomingRequests, 'remove').mockReturnValue();
      jest.spyOn(current.friends, 'add').mockReturnValue();
      jest.spyOn(receiver.friends, 'add').mockReturnValue();

      const response = await service.addFriendRequest(current.id, receiver.id);
      expect(response).toBeTruthy();
    });

    it('should throw a NotFoundException if a user cannot be found for the given ID', async () => {
      repository.findOne = jest.fn().mockReturnValueOnce(current).mockReturnValueOnce(null);

      expect(async () => await service.addFriendRequest(current.id, receiver.id)).rejects.toThrow(
        new NotFoundException(),
      );
    });
  });

  describe('AcceptFriendRequest', () => {
    it('should successfully remove the friend request and add each other as friends on successful request', async () => {
      jest.spyOn(current.incomingRequests, 'contains').mockReturnValue(true);
      jest.spyOn(current.incomingRequests, 'remove').mockReturnValue();
      jest.spyOn(current.friends, 'add').mockReturnValue();
      jest.spyOn(receiver.friends, 'add').mockReturnValue();

      const response = await service.acceptFriendRequest(current.id, receiver.id);
      expect(response).toBeTruthy();
    });

    it('should throw a BadRequestException if both IDs are equal', async () => {
      expect(async () => await service.acceptFriendRequest(current.id, current.id)).rejects.toThrow(
        new BadRequestException({ message: 'You cannot accept yourself' }),
      );
    });

    it('should return false if no incoming request exists', async () => {
      jest.spyOn(current.incomingRequests, 'contains').mockReturnValue(false);

      const response = await service.acceptFriendRequest(current.id, receiver.id);

      expect(response).toBeFalsy();
    });

    it('should throw a NotFoundException if a user cannot be found for the given ID', async () => {
      repository.findOne = jest.fn().mockReturnValueOnce(current).mockReturnValueOnce(null);

      expect(
        async () => await service.acceptFriendRequest(current.id, receiver.id),
      ).rejects.toThrow(new NotFoundException());
    });
  });

  describe('RemoveFriendRequest', () => {
    it("should successfully remove the incoming friend's request and return true", async () => {
      jest.spyOn(current.incomingRequests, 'contains').mockReturnValue(true);
      jest.spyOn(current.incomingRequests, 'remove').mockReturnValue();

      const response = await service.removeFriendRequest(current.id, receiver.id);
      expect(response).toBeTruthy();
    });

    it("should successfully remove the outgoing friend's request and return true", async () => {
      jest.spyOn(current.outgoingRequests, 'contains').mockReturnValue(true);
      jest.spyOn(current.outgoingRequests, 'remove').mockReturnValue();

      const response = await service.removeFriendRequest(current.id, receiver.id);
      expect(response).toBeTruthy();
    });

    it('should throw a BadRequestException if both IDs are equal', async () => {
      expect(async () => await service.removeFriendRequest(current.id, current.id)).rejects.toThrow(
        new BadRequestException({ message: 'You cannot remove yourself' }),
      );
    });

    it('should return true even if no request existed', async () => {
      jest.spyOn(current.incomingRequests, 'contains').mockReturnValue(false);

      const response = await service.removeFriendRequest(current.id, receiver.id);

      expect(response).toBeTruthy();
    });

    it('should throw a NotFoundException if a user cannot be found for the given ID', async () => {
      repository.findOne = jest.fn().mockReturnValueOnce(current).mockReturnValueOnce(null);

      expect(
        async () => await service.acceptFriendRequest(current.id, receiver.id),
      ).rejects.toThrow(new NotFoundException());
    });
  });

  describe('GetFriendRequests', () => {
    it("should successfully return a list of the current user's incoming and outgoing friend requests", async () => {
      repository.findOne = jest.fn().mockReturnValueOnce(current);

      const outgoing: User[] = [];
      for (let i = 0; i < 3; i++) {
        outgoing.push(getMockUser());
      }

      const incoming: User[] = [];
      for (let i = 0; i < 3; i++) {
        incoming.push(getMockUser());
      }

      jest.spyOn(current.incomingRequests, 'getItems').mockReturnValue(incoming);
      jest.spyOn(current.outgoingRequests, 'getItems').mockReturnValue(outgoing);

      const response = await service.getFriendRequests(current.id);

      expect(response.length).toEqual(6);
    });

    it('should throw a NotFoundException if a user cannot be found for the given ID', async () => {
      repository.findOne = jest.fn().mockReturnValueOnce(null);

      expect(async () => await service.getFriendRequests(current.id)).rejects.toThrow(
        new NotFoundException(),
      );
    });
  });

  describe('GetFriends', () => {
    it("should successfully return a list of the current user's friends", async () => {
      repository.findOne = jest.fn().mockReturnValueOnce(current);

      const friends: User[] = [];
      for (let i = 0; i < 3; i++) {
        friends.push(getMockUser());
      }

      jest.spyOn(current.friends, 'getItems').mockReturnValue(friends);

      const response = await service.getFriends(current.id);

      expect(response.length).toEqual(3);
    });

    it('should throw a NotFoundException if a user cannot be found for the given ID', async () => {
      repository.findOne = jest.fn().mockReturnValueOnce(null);

      expect(async () => await service.getFriends(current.id)).rejects.toThrow(
        new NotFoundException(),
      );
    });
  });

  describe('RemoveFriend', () => {
    it('should successfully remove the friend and return true', async () => {
      jest.spyOn(current.friends, 'contains').mockReturnValue(true);
      jest.spyOn(current.friends, 'remove').mockReturnValue();
      jest.spyOn(receiver.friends, 'remove').mockReturnValue();

      const response = await service.removeFriend(current.id, receiver.id);
      expect(response).toBeTruthy();
    });

    it('should throw a BadRequestException if both IDs are equal', async () => {
      expect(async () => await service.removeFriend(current.id, current.id)).rejects.toThrow(
        new BadRequestException({ message: 'You cannot remove yourself' }),
      );
    });

    it('should return true even if no request existed', async () => {
      jest.spyOn(current.friends, 'contains').mockReturnValue(false);

      const response = await service.removeFriend(current.id, receiver.id);

      expect(response).toBeTruthy();
    });

    it('should throw a NotFoundException if a user cannot be found for the given ID', async () => {
      repository.findOne = jest.fn().mockReturnValueOnce(current).mockReturnValueOnce(null);

      expect(async () => await service.removeFriend(current.id, receiver.id)).rejects.toThrow(
        new NotFoundException(),
      );
    });
  });
});
