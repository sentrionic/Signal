import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ConfigModule } from '@nestjs/config';
import { ConfigSchema } from './common/schema/config.schema';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { FriendsModule } from './friends/friends.module';
import { JwtStrategy } from '@senorg/common';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: ConfigSchema,
    }),
    MikroOrmModule.forRoot(),
    UsersModule,
    FriendsModule,
  ],
  providers: [AppService, JwtStrategy],
})
export class AppModule {}
