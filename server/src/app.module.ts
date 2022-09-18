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
  ],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}
