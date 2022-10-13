import { Module } from '@nestjs/common';
import { RmqService } from '@senorg/common';
import { SocketModule } from 'src/socket/socket.module';
import { MessagesController } from './messages.controller';

@Module({
  imports: [SocketModule],
  controllers: [MessagesController],
  providers: [RmqService],
})
export class MessagesModule {}
