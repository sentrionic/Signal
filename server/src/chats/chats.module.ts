import { Module } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { ChatsController } from './chats.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from '../users/entities/user.entity';
import { Chat } from './entities/chat.entity';
import { Message } from '../messages/entities/message.entity';

@Module({
  imports: [MikroOrmModule.forFeature({ entities: [Chat, User, Message] })],
  controllers: [ChatsController],
  providers: [ChatsService],
})
export class ChatsModule {}
