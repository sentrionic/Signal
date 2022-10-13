import * as jwt from 'jsonwebtoken';
import { Socket } from 'socket.io';
import { getTokenFromCookie } from './getTokenFromCookie';

interface Payload {
  userId: string;
}

export const getSessionId = (client: Socket): string => {
  const token = getTokenFromCookie(client);
  const { userId } = jwt.verify(token, process.env.SESSION_SECRET) as Payload;
  return userId;
};
