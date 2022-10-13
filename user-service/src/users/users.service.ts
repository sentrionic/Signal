import { EntityRepository, UniqueConstraintViolationException } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  AvatarUploadedEvent,
  formatErrors,
  BufferFile,
  Subjects,
  Services,
  UserCreatedEvent,
  UserUpdatedEvent,
} from '@senorg/common';
import { catchError, lastValueFrom } from 'rxjs';
import { Account } from './dto/account.response';
import { LoginInput } from './dto/login.input';
import { RegisterInput } from './dto/register.input';
import { UpdateUserInput } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: EntityRepository<User>,
    @Inject(Services.Media)
    private readonly mediaClient: ClientProxy,
    @Inject(Services.Notification)
    private readonly notificationClient: ClientProxy,
    @Inject(Services.Chat)
    private readonly chatClient: ClientProxy,
  ) {}

  async register(input: RegisterInput): Promise<Account> {
    const { email, displayName, password } = input;

    const user: User = new User(email, displayName, password);

    try {
      await this.userRepository.persistAndFlush(user);
    } catch (err) {
      this.logger.warn(err);

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

    const event = new UserCreatedEvent(
      user.id,
      user.username,
      user.bio,
      user.displayName,
      user.image,
      user.version,
    );

    this.notificationClient.emit(Subjects.UserCreated, event);
    this.chatClient.emit(Subjects.UserCreated, event);

    return user.toAccount();
  }

  async login(input: LoginInput): Promise<Account> {
    const { email, password } = input;

    const user = await this.userRepository.findOne({ email });

    if (!user) {
      throw new UnauthorizedException(
        formatErrors([{ field: 'email', message: 'Invalid Credentials' }]),
      );
    }

    const isValid = await user.isPasswordValid(password);

    if (!isValid) {
      throw new UnauthorizedException(
        formatErrors([{ field: 'email', message: 'Invalid Credentials' }]),
      );
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
    user.bio = bio;

    if (user.displayName !== displayName) {
      user.displayName = displayName;
      user.username = user.generateUsername(displayName);
    }

    if (image) {
      const directory = `signal/users/${id}`;

      user.image = await lastValueFrom(
        this.mediaClient
          .send(Subjects.MediaAvatarUploaded, new AvatarUploadedEvent(image, directory))
          .pipe(
            catchError(() => {
              this.logger.error('Error uploading the avatar');
              throw new InternalServerErrorException(
                'Media Server is currently down. Please try again later',
              );
            }),
          ),
      );
    }

    try {
      await this.userRepository.flush();
    } catch (err) {
      this.logger.warn(err);

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

    const event = new UserUpdatedEvent(
      user.id,
      user.username,
      user.bio,
      user.displayName,
      user.image,
      user.version,
    );

    this.chatClient.emit(Subjects.UserUpdated, event);

    return user.toAccount();
  }
}
