import { createClient, RedisClientType } from 'redis';

let client: RedisClientType | null;

export const getRedisClient = async (): Promise<RedisClientType> => {
  if (!client) {
    client = createClient({ legacyMode: true });
    await client.connect();
  }

  return client;
};
