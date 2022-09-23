import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from '../users/entities/user.entity';
import { Chat } from '../chats/entities/chat.entity';
import { Message } from './entities/message.entity';
import { Attachment } from './entities/attachment.entity';
import { FilesService } from '../files/file.service';
import { ConfigService } from '@nestjs/config';
import { SocketModule } from '../socket/socket.module';

@Module({
  imports: [
    MikroOrmModule.forFeature({ entities: [User, Chat, Message, Attachment] }),
    SocketModule,
  ],
  controllers: [MessagesController],
  providers: [MessagesService, FilesService, ConfigService],
})
export class MessagesModule {}
