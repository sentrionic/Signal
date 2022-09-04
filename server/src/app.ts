import { NestExpressApplication } from '@nestjs/platform-express';
import * as session from 'express-session';
import * as connectRedis from 'connect-redis';
import { getRedisClient } from './common/utils/redis';
import { ConfigService } from '@nestjs/config';
import { config } from 'aws-sdk';

const __prod__ = process.env.NODE_ENV === 'production';

export const setupApp = async (app: NestExpressApplication) => {
  const configService = app.get(ConfigService);

  // @ts-ignore
  const RedisStore = connectRedis(session);
  const redis = await getRedisClient();

  app.setGlobalPrefix('api');
  app.set('trust proxy', 1);
  app.enableCors({
    credentials: true,
    origin: process.env.CORS_ORIGIN,
  });

  app.use(
    //@ts-ignore
    session({
      name: configService.get('COOKIE_NAME'),
      store: new RedisStore({
        //@ts-ignore
        client: redis,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        httpOnly: true,
        sameSite: 'lax', // csrf
        secure: __prod__, // cookie only works in https,
        domain: __prod__ ? '.signal.io' : undefined,
      },
      saveUninitialized: false,
      secret: process.env.SECRET,
      resave: true,
      rolling: true,
    }),
  );

  config.update({
    accessKeyId: configService.get('AWS_ACCESS_KEY'),
    secretAccessKey: configService.get('AWS_SECRET_ACCESS_KEY'),
    region: configService.get('AWS_S3_REGION'),
  });
};
