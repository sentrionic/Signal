import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { RmqService, Services } from '@senorg/common';
import { config } from 'aws-sdk';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const rmqService = app.get<RmqService>(RmqService);

  app.connectMicroservice(rmqService.getOptions(Services.Media, true));

  config.update({
    accessKeyId: configService.get('AWS_ACCESS_KEY'),
    secretAccessKey: configService.get('AWS_SECRET_ACCESS_KEY'),
    region: configService.get('AWS_S3_REGION'),
  });

  await app.startAllMicroservices();
}
bootstrap();
