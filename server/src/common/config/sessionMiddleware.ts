import * as session from 'express-session';
import * as connectRedis from 'connect-redis';
import e from 'express';
import { ConfigService } from '@nestjs/config';
import { getRedisClient } from '../utils/redis';

const RedisStore = connectRedis(session);

const __prod__ = process.env.NODE_ENV === 'production';

export const setupSession = async (config: ConfigService): Promise<e.RequestHandler> =>
  session({
    name: config.get('COOKIE_NAME'),
    store: new RedisStore({
      //@ts-ignore
      client: await getRedisClient(),
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
    secret: config.get('SECRET').toString(),
    resave: true,
    rolling: true,
  });
