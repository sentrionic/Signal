import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from './entities/user.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { EnvironmentVariables } from '../common/types/env';
import { RmqModule, Services } from '@senorg/common';

@Module({
  imports: [
    MikroOrmModule.forFeature({ entities: [User] }),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService<EnvironmentVariables>) => ({
        secret: configService.get('SESSION_SECRET'),
        signOptions: {
          expiresIn: configService.get('SESSION_DURATION') / 1000 + 's',
        },
      }),
    }),
    RmqModule.register({ name: Services.Media }),
    RmqModule.register({ name: Services.Notification }),
    RmqModule.register({ name: Services.Chat }),
  ],
  controllers: [UsersController],
  providers: [ConfigService, UsersService],
})
export class UsersModule {}
