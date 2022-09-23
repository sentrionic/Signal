import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { config } from 'aws-sdk';
import { setupSession } from './common/config/sessionMiddleware';

export const setupApp = async (app: NestExpressApplication) => {
  const configService = app.get(ConfigService);

  app.setGlobalPrefix('api');
  app.set('trust proxy', 1);
  app.enableCors({
    credentials: true,
    origin: process.env.CORS_ORIGIN,
  });

  app.use(await setupSession(configService));

  config.update({
    accessKeyId: configService.get('AWS_ACCESS_KEY'),
    secretAccessKey: configService.get('AWS_SECRET_ACCESS_KEY'),
    region: configService.get('AWS_S3_REGION'),
  });
};
