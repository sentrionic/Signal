import { io } from 'socket.io-client';

export const getSocket = () =>
  io(`${import.meta.env.VITE_SERVER_WS}`, {
    transports: ['websocket'],
    upgrade: false,
  });
