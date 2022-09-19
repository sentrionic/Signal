import { Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { MikroORM, UseRequestContext } from '@mikro-orm/core';
import { WsException } from '@nestjs/websockets';
import { Chat } from '../chats/entities/chat.entity';

@Injectable()
export class SocketService {
  constructor(private readonly orm: MikroORM) {}

  private getUserIdFromSession(client: Socket): string {
    // @ts-ignore
    return client.handshake.session.userId;
  }

  /**
   * Joins the given room if the user is a member of the room
   * @param client
   * @param room
   */
  @UseRequestContext()
  async joinChat(client: Socket, room: string): Promise<void> {
    const id = this.getUserIdFromSession(client);

    const chat = await this.orm.em.findOne(Chat, { id: room }, { populate: ['members'] });

    if (!chat) {
      throw new WsException('Not Found');
    }

    if (!chat.members.getItems().find((m) => m.id === id)) {
      throw new WsException('Not Authorized');
    }

    client.join(room);
  }
}
