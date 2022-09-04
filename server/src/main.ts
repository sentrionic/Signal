import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { setupApp } from './app';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  await setupApp(app);

  await app.listen(process.env.PORT || 3000);
}

bootstrap();
