import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AppService } from './app.service';
import { ConfigSchema } from './common/schema/config.schema';
import { FriendsModule } from './friends/friends.module';
import { ChatsModule } from './chats/chats.module';
import { GroupsModule } from './groups/groups.module';
import { MessagesModule } from './messages/messages.module';
import { SocketModule } from './socket/socket.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: ConfigSchema,
    }),
    MikroOrmModule.forRoot(),
    UsersModule,
    FriendsModule,
    ChatsModule,
    GroupsModule,
    MessagesModule,
    SocketModule,
  ],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}
