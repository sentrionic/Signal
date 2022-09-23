import { io } from 'socket.io-client';

export const useSocket = () =>
  io(`${import.meta.env.VITE_SERVER_WS}`, {
    transports: ['websocket'],
    upgrade: false,
  });
