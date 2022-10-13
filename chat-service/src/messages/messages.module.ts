import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from '../users/entities/user.entity';
import { Chat } from '../chats/entities/chat.entity';
import { Message } from './entities/message.entity';
import { Attachment } from './entities/attachment.entity';
import { ConfigService } from '@nestjs/config';
import { RmqModule, Services } from '@senorg/common';

@Module({
  imports: [
    MikroOrmModule.forFeature({ entities: [User, Chat, Message, Attachment] }),
    RmqModule.register({ name: Services.Media }),
    RmqModule.register({ name: Services.Notification }),
  ],
  controllers: [MessagesController],
  providers: [MessagesService, ConfigService],
})
export class MessagesModule {}
