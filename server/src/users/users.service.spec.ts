import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { FilesService } from '../files/file.service';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { User } from './entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { userMock } from './mocks/user.mock';
import { validate } from 'uuid';
import { UniqueConstraintViolationException } from '@mikro-orm/core';
import { Account } from './dto/account.response';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { formatErrors } from '../common/dto/error.response';
import { UpdateUserInput } from './dto/update-user.dto';
import { fileMock } from './mocks/file.mock';

describe('UsersService', () => {
  let service: UsersService;
  let fileService: FilesService;

  const repository = {
    persistAndFlush: jest.fn(),
    findOne: jest.fn(),
    flush: jest.fn(),
  };
  const usernameRegex = new RegExp('^.{3,32}#[0-9]{4}$');

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigService,
        UsersService,
        FilesService,
        {
          provide: getRepositoryToken(User),
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    fileService = module.get<FilesService>(FilesService);
  });

  describe('Register', () => {
    let persistAndFlush: jest.Mock;
    const user = userMock;

    it('should successfully create the account for valid input and return it', async () => {
      persistAndFlush = jest.fn().mockReturnValue(Promise<void>);
      repository.persistAndFlush = persistAndFlush;

      const result = await service.register({ ...user });

      validateUserResponse(result, user);
    });

    it('should throw an error if calling register with an email that already exists', async () => {
      persistAndFlush = jest
        .fn()
        .mockRejectedValue(new UniqueConstraintViolationException(new Error()));
      repository.persistAndFlush = persistAndFlush;

      const user = { ...userMock };
      return expect(async () => await service.register({ ...user })).rejects.toThrow(
        new BadRequestException(
          formatErrors([
            {
              field: 'email',
              message: 'An account with that email already exists',
            },
          ]),
        ),
      );
    });

    it('should throw an InternalErrorException if an error occurs during saving', async () => {
      persistAndFlush = jest.fn().mockRejectedValue(new Error());
      repository.persistAndFlush = persistAndFlush;

      const user = { ...userMock };
      return expect(async () => await service.register({ ...user })).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('Login', () => {
    let findOne: jest.Mock;
    const user = userMock;

    it('should successfully find and return a user when login is called', async () => {
      findOne = jest.fn().mockReturnValue(Promise.resolve(user));
      repository.findOne = findOne;

      const passwordSpy = jest
        .spyOn(user, 'isPasswordValid')
        .mockImplementation(() => Promise.resolve(true));

      const result = await service.login({ ...user });

      validateUserResponse(result, user);
      expect(passwordSpy).toHaveBeenCalled();
    });

    it('should return an InvalidCredentials error if no user was found for the given email', async () => {
      findOne = jest.fn().mockReturnValue(Promise.resolve(null));
      repository.findOne = findOne;

      return expect(async () => await service.login({ ...user })).rejects.toThrow(
        new UnauthorizedException(
          formatErrors([
            {
              field: 'email',
              message: 'Invalid Credentials',
            },
          ]),
        ),
      );
    });

    it('should return an InvalidCredentials error if the password is invalid', async () => {
      findOne = jest.fn().mockReturnValue(Promise.resolve(user));
      repository.findOne = findOne;

      const passwordSpy = jest
        .spyOn(user, 'isPasswordValid')
        .mockImplementation(() => Promise.resolve(false));

      expect(async () => await service.login({ ...user })).rejects.toThrow(
        new UnauthorizedException(
          formatErrors([
            {
              field: 'email',
              message: 'Invalid Credentials',
            },
          ]),
        ),
      );
      expect(passwordSpy).toHaveBeenCalled();
    });
  });

  describe('GetCurrent', () => {
    let findOne: jest.Mock;
    const user = userMock;

    it('should successfully return the current user', async () => {
      findOne = jest.fn().mockReturnValue(Promise.resolve(user));
      repository.findOne = findOne;

      const result = await service.getCurrent(user.id);

      validateUserResponse(result, user);
    });

    it('should throw an error if the user is not found', async () => {
      findOne = jest.fn().mockReturnValue(Promise.resolve(null));
      repository.findOne = findOne;

      return expect(async () => await service.getCurrent(user.id)).rejects.toThrow(
        new NotFoundException(),
      );
    });
  });

  describe('UpdateAccount', () => {
    let findOne: jest.Mock;
    let flush: jest.Mock;
    const user = userMock;

    const updateInput: UpdateUserInput = {
      email: 'email_updated@example.com',
      displayName: 'Test Updated',
      bio: 'The owner of this application',
    };

    it('should successfully update and return the updated user', async () => {
      findOne = jest.fn().mockReturnValue(Promise.resolve(user));
      repository.findOne = findOne;

      flush = jest.fn().mockReturnValue(Promise<void>);
      repository.flush = flush;

      const uploadSpy = jest.spyOn(fileService, 'uploadAvatar');
      user.username = `${updateInput.displayName}#0123`;

      const result = await service.updateAccount(user.id, updateInput);

      validateUserResponse(result, user);

      expect(uploadSpy).not.toHaveBeenCalled();
    });

    it('should throw an error if the user is not found', async () => {
      findOne = jest.fn().mockReturnValue(Promise.resolve(null));
      repository.findOne = findOne;

      return expect(async () => await service.updateAccount(user.id, updateInput)).rejects.toThrow(
        new NotFoundException(),
      );
    });

    it('should throw an error if calling update with an email that is already taken', async () => {
      findOne = jest.fn().mockReturnValue(Promise.resolve(user));
      repository.findOne = findOne;

      flush = jest.fn().mockRejectedValue(new UniqueConstraintViolationException(new Error()));
      repository.flush = flush;

      return expect(async () => await service.updateAccount(user.id, updateInput)).rejects.toThrow(
        new BadRequestException(
          formatErrors([
            {
              field: 'email',
              message: 'An account with that email already exists',
            },
          ]),
        ),
      );
    });

    it('should successfully update and return the updated user with the new image if an image is provided', async () => {
      findOne = jest.fn().mockReturnValue(Promise.resolve(user));
      repository.findOne = findOne;

      flush = jest.fn().mockReturnValue(Promise<void>);
      repository.flush = flush;

      const uploadSpy = jest
        .spyOn(fileService, 'uploadAvatar')
        .mockReturnValue(Promise.resolve('avatar.webp'));
      user.username = `${updateInput.displayName}#0123`;
      const file = { ...fileMock };

      const result = await service.updateAccount(user.id, updateInput, file);

      validateUserResponse(result, user);

      expect(uploadSpy).toHaveBeenCalled();
    });

    it('should return an error when an error occurs during the file upload', async () => {
      findOne = jest.fn().mockReturnValue(Promise.resolve(user));
      repository.findOne = findOne;

      jest.spyOn(fileService, 'uploadAvatar').mockRejectedValue(new Error());
      user.username = `${updateInput.displayName}#0123`;
      const file = { ...fileMock };

      expect(async () => await service.updateAccount(user.id, updateInput, file)).rejects.toThrow(
        new InternalServerErrorException(),
      );
    });
  });

  const validateUserResponse = (result: Account, user: User) => {
    //@ts-ignore
    expect(result).toEqual<Account>({
      id: expect.any(String),
      displayName: user.displayName,
      email: user.email,
      username: expect.stringContaining(user.displayName),
      image: user.image,
      bio: user.bio,
    });

    expect(validate(result.id)).toBeTruthy();
    expect(result.username).toMatch(usernameRegex);
  };
});
