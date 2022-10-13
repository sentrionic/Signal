import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';

export const setupApp = (app: NestExpressApplication) => {
  app.setGlobalPrefix('api');
  app.set('trust proxy', 1);
  app.use(cookieParser());
  app.enableShutdownHooks();
};
