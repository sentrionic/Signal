import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { NestFactory } from '@nestjs/core';
import { RmqService, Services } from '@senorg/common';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.set('trust proxy', 1);
  app.use(cookieParser());
  app.enableShutdownHooks();

  const rmqService = app.get<RmqService>(RmqService);
  const configService = app.get<ConfigService>(ConfigService);

  app.connectMicroservice(rmqService.getOptions(Services.Notification));
  app.connectMicroservice(rmqService.getOptions(Services.User));

  await app.startAllMicroservices();
  await app.listen(configService.get<string>('PORT') || 4000);
}
bootstrap();
