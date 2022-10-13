import { Module } from '@nestjs/common';
import { FriendsController } from './friends.controller';
import { RmqService } from '@senorg/common';
import { SocketModule } from '../socket/socket.module';
import { FriendService } from './friend.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from './entities/user.entity';

@Module({
  imports: [SocketModule, MikroOrmModule.forFeature([User])],
  controllers: [FriendsController],
  providers: [RmqService, FriendService],
})
export class FriendsModule {}
