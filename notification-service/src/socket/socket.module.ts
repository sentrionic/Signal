import { Module } from '@nestjs/common';
import { SocketService } from './socket.service';
import { AppGateway } from './app.gateway';
import { RmqModule, Services } from '@senorg/common';

@Module({
  imports: [RmqModule.register({ name: Services.Chat })],
  providers: [AppGateway, SocketService],
  exports: [SocketService],
})
export class SocketModule {}
