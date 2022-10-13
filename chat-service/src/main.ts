import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync } from 'fs';
import { setupApp } from './app';
import { AppModule } from './app.module';
import { RmqService, Services } from '@senorg/common';
import { RmqOptions } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  setupApp(app);

  const rmqService = app.get<RmqService>(RmqService);
  app.connectMicroservice<RmqOptions>(rmqService.getOptions(Services.Chat));

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Signal API - Chat Service')
    .setDescription('The API for the Signal chat service')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  writeFileSync('./swagger-spec.json', JSON.stringify(document, null, 2));
  SwaggerModule.setup('/', app, document);

  await app.startAllMicroservices();
  await app.listen(process.env.PORT || 4000);
}
bootstrap();
