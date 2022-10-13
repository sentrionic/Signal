import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { ChatsModule } from './chats/chats.module';
import { MessagesModule } from './messages/messages.module';
import { GroupsModule } from './groups/groups.module';
import { ConfigSchema } from './common/schema/config.schema';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { JwtStrategy, RmqModule } from '@senorg/common';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: ConfigSchema,
    }),
    MikroOrmModule.forRoot(),
    ChatsModule,
    MessagesModule,
    UsersModule,
    GroupsModule,
    RmqModule,
  ],
  controllers: [],
  providers: [AppService, JwtStrategy],
})
export class AppModule {}
