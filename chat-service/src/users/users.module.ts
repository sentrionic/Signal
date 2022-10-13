import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from './entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { RmqModule } from '@senorg/common';
import { ChatMember } from '../chats/entities/member.entity';

@Module({
  imports: [MikroOrmModule.forFeature({ entities: [User, ChatMember] }), RmqModule],
  controllers: [UsersController],
  providers: [ConfigService, UsersService],
})
export class UsersModule {}
