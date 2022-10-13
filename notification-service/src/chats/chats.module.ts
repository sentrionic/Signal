import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { RmqService } from '@senorg/common';
import { User } from '../friends/entities/user.entity';
import { SocketModule } from '../socket/socket.module';
import { ChatsController } from './chats.controller';
import { ChatsService } from './chats.service';
import { Chat } from './entities/chat.entity';

@Module({
  imports: [MikroOrmModule.forFeature([Chat, User]), SocketModule],
  controllers: [ChatsController],
  providers: [ChatsService, RmqService],
})
export class ChatsModule {}
