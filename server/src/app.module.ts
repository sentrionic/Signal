import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AppService } from './app.service';
import { configSchema } from './common/schema/config.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: configSchema,
    }),
    MikroOrmModule.forRoot(),
    UsersModule,
  ],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}
