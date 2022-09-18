import { Module } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { ChatsController } from './chats.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from '../users/entities/user.entity';
import { Chat } from './entities/chat.entity';

@Module({
  imports: [MikroOrmModule.forFeature({ entities: [Chat, User] })],
  controllers: [ChatsController],
  providers: [ChatsService],
})
export class ChatsModule {}
