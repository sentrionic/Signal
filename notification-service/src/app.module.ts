import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RmqModule } from '@senorg/common';
import { ConfigSchema } from './common/schema/config.schema';
import { SocketModule } from './socket/socket.module';
import { FriendsModule } from './friends/friends.module';
import { MessagesModule } from './messages/messages.module';
import { ChatsModule } from './chats/chats.module';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: ConfigSchema,
    }),
    MikroOrmModule.forRoot(),
    SocketModule,
    RmqModule,
    ChatsModule,
    FriendsModule,
    MessagesModule,
  ],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}
