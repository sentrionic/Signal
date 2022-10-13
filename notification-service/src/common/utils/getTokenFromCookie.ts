import { Socket } from 'socket.io';

export const getTokenFromCookie = (client: Socket): string => {
  const cookie = client.handshake.headers.cookie;
  const token = cookie.slice(cookie.indexOf('=') + 1);
  return token;
};
