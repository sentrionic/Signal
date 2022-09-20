import {
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { setupSession } from '../common/config/sessionMiddleware';
import { ConfigService } from '@nestjs/config';
import * as sharedsession from 'express-socket.io-session';
import { SocketService } from './socket.service';
import { WsAuthGuard } from '../common/guards/ws.auth.guard';
import { UseGuards } from '@nestjs/common';

@WebSocketGateway({
  namespace: '/ws',
  transports: ['websocket'],
  upgrade: false,
})
export class AppGateway implements OnGatewayInit {
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly configService: ConfigService,
    private readonly socketService: SocketService,
  ) {}

  async afterInit(server: Server) {
    this.socketService.setupSocket(server);
    // @ts-ignore
    server.use(sharedsession(await setupSession(this.configService)));
  }

  @SubscribeMessage('joinChat')
  @UseGuards(WsAuthGuard)
  handleChatJoin(client: Socket, room: string): void {
    this.socketService.joinChat(client, room);
  }

  @SubscribeMessage('leaveChat')
  @UseGuards(WsAuthGuard)
  handleChatLeave(client: Socket, room: string): void {
    client.leave(room);
  }

  @SubscribeMessage('startTyping')
  @UseGuards(WsAuthGuard)
  handleStartTyping(_: Socket, data: string[]): void {
    const room = data[0];
    const username = data[1];
    this.socketService.addTyping(room, username);
  }

  @SubscribeMessage('stopTyping')
  @UseGuards(WsAuthGuard)
  handleStopTyping(_: Socket, data: string[]): void {
    const room = data[0];
    const username = data[1];
    this.socketService.stopTyping(room, username);
  }
}
