import { Module } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { FriendsController } from './friends.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from '../users/entities/user.entity';
import { SocketModule } from '../socket/socket.module';

@Module({
  imports: [MikroOrmModule.forFeature({ entities: [User] }), SocketModule],
  controllers: [FriendsController],
  providers: [FriendsService],
})
export class FriendsModule {}
