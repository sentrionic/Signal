import { Module } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from '../users/entities/user.entity';
import { Chat } from '../chats/entities/chat.entity';
import { ChatMember } from '../chats/entities/member.entity';
import { RmqModule, Services } from '@senorg/common';

@Module({
  imports: [
    MikroOrmModule.forFeature({ entities: [User, Chat, ChatMember] }),
    RmqModule.register({ name: Services.Notification }),
  ],
  controllers: [GroupsController],
  providers: [GroupsService],
})
export class GroupsModule {}
