import { Module } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { FriendsController } from './friends.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from '../users/entities/user.entity';
import { RmqModule, Services } from '@senorg/common';

@Module({
  imports: [
    MikroOrmModule.forFeature({ entities: [User] }),
    RmqModule.register({ name: Services.Notification }),
  ],
  controllers: [FriendsController],
  providers: [FriendsService],
})
export class FriendsModule {}
