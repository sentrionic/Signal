import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Chat } from '../chats/entities/chat.entity';
import { SocketService } from './socket.service';
import { AppGateway } from './app.gateway';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [MikroOrmModule.forFeature([Chat])],
  providers: [SocketService, AppGateway, ConfigService],
  exports: [SocketService],
})
export class SocketModule {}
