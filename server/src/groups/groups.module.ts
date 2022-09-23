import { Module } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from '../users/entities/user.entity';
import { Chat } from '../chats/entities/chat.entity';
import { SocketModule } from '../socket/socket.module';
import { ChatMember } from '../chats/entities/member.entity';

@Module({
  imports: [MikroOrmModule.forFeature({ entities: [User, Chat, ChatMember] }), SocketModule],
  controllers: [GroupsController],
  providers: [GroupsService],
})
export class GroupsModule {}
