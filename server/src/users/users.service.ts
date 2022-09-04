import { EntityRepository, UniqueConstraintViolationException } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { BufferFile } from '../common/types/buffer.file';
import { formatErrors } from '../common/dto/error.response';
import { Account } from './dto/account.response';
import { LoginInput } from './dto/login.input';
import { RegisterInput } from './dto/register.input';
import { UpdateUserInput } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { FilesService } from '../files/file.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: EntityRepository<User>,
    private fileService: FilesService,
  ) {}

  async register(input: RegisterInput): Promise<Account> {
    const { email, displayName, password } = input;

    const user: User = new User(email, displayName, password);

    try {
      await this.userRepository.persistAndFlush(user);
    } catch (err) {
      if (err instanceof UniqueConstraintViolationException) {
        throw new BadRequestException(
          formatErrors([
            {
              field: 'email',
              message: 'An account with that email already exists',
            },
          ]),
        );
      }

      throw new InternalServerErrorException({
        message: 'Something went wrong',
      });
    }

    return user.toAccount();
  }

  async login(input: LoginInput): Promise<Account> {
    const { email, password } = input;

    const user = await this.userRepository.findOne({ email });

    if (!user) {
      throw new UnauthorizedException(formatErrors([{ field: 'email', message: 'Invalid Credentials' }]));
    }

    const isValid = await user.isPasswordValid(password);

    if (!isValid) {
      throw new UnauthorizedException(formatErrors([{ field: 'email', message: 'Invalid Credentials' }]));
    }

    return user.toAccount();
  }

  async getCurrent(id: string): Promise<Account> {
    const user = await this.userRepository.findOne({ id });

    if (!user) {
      throw new NotFoundException();
    }

    return user.toAccount();
  }

  async updateAccount(id: string, input: UpdateUserInput, image?: BufferFile): Promise<Account> {
    const user = await this.userRepository.findOne({ id });

    if (!user) {
      throw new NotFoundException();
    }

    const { email, displayName, bio } = input;

    user.email = email;
    user.displayName = displayName;
    user.bio = bio;

    if (image) {
      const directory = `signal/users/${id}`;

      try {
        user.image = await this.fileService.uploadAvatar(directory, image);
      } catch (err) {
        console.log(err);
        throw new InternalServerErrorException();
      }
    }

    try {
      await this.userRepository.flush();
    } catch (err) {
      if (err instanceof UniqueConstraintViolationException) {
        throw new BadRequestException(
          formatErrors([
            {
              field: 'email',
              message: 'An account with that email already exists',
            },
          ]),
        );
      }

      throw new InternalServerErrorException({
        message: 'Something went wrong',
      });
    }

    return user.toAccount();
  }
}
