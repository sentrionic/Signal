import { Module } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { ChatsController } from './chats.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from '../users/entities/user.entity';
import { Chat } from './entities/chat.entity';
import { GroupsService } from '../groups/groups.service';
import { Group } from '../groups/entities/group.entity';

@Module({
  imports: [MikroOrmModule.forFeature({ entities: [Chat, User, Group] })],
  controllers: [ChatsController],
  providers: [ChatsService, GroupsService],
})
export class ChatsModule {}
