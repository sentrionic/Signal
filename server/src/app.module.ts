import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AppService } from './app.service';
import { ConfigSchema } from './common/schema/config.schema';
import { FriendsModule } from './friends/friends.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: ConfigSchema,
    }),
    MikroOrmModule.forRoot(),
    UsersModule,
    FriendsModule,
  ],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}
