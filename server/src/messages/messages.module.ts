import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from '../users/entities/user.entity';
import { Group } from '../groups/entities/group.entity';
import { Chat } from '../chats/entities/chat.entity';
import { Message } from './entities/message.entity';
import { Attachment } from './entities/attachment.entity';

@Module({
  imports: [MikroOrmModule.forFeature({ entities: [User, Group, Chat, Message, Attachment] })],
  controllers: [MessagesController],
  providers: [MessagesService],
})
export class MessagesModule {}
