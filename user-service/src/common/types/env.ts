export interface EnvironmentVariables {
  DATABASE_URL: string;
  RABBIT_MQ_URI: string;
  RABBIT_MQ_MEDIA_QUEUE: string;
  PORT: number;
  SESSION_SECRET: string;
  COOKIE_NAME: string;
  SESSION_DURATION: number;
}
