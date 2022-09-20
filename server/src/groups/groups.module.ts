import { Module } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from '../users/entities/user.entity';
import { Group } from './entities/group.entity';
import { Chat } from '../chats/entities/chat.entity';
import { SocketModule } from '../socket/socket.module';

@Module({
  imports: [MikroOrmModule.forFeature({ entities: [User, Chat, Group] }), SocketModule],
  controllers: [GroupsController],
  providers: [GroupsService],
})
export class GroupsModule {}
