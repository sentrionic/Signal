import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { MikroORM, UseRequestContext } from '@mikro-orm/core';
import { WsException } from '@nestjs/websockets';
import { Chat } from '../chats/entities/chat.entity';
import { MessageResponse } from '../messages/dto/message.response';

@Injectable()
export class SocketService {
  private socket: Server | null = null;

  private get server(): Server {
    if (!this.socket) throw new WsException({ message: 'Server not initialized' });
    return this.socket;
  }

  constructor(private readonly orm: MikroORM) {}

  setupSocket(socket: Server): void {
    this.socket = socket;
  }

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

  /**
   * Emits a "new_message" event
   * @param room The id of the room
   * @param message The new message
   */
  sendMessage(room: string, message: MessageResponse) {
    this.server.to(room).emit('new_message', message);
  }

  /**
   * Emits an "edit_message" event
   * @param room The id of the room
   * @param message The edited message
   */
  editMessage(room: string, message: MessageResponse) {
    this.server.to(room).emit('edit_message', message);
  }

  /**
   * Emits a "delete_message" event
   * @param room The id of the room
   * @param id The id of the deleted message
   */
  deleteMessage(room: string, id: string) {
    this.server.to(room).emit('delete_message', id);
  }
}
