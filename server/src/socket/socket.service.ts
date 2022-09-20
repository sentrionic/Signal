import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { MikroORM, UseRequestContext } from '@mikro-orm/core';
import { WsException } from '@nestjs/websockets';
import { Chat } from '../chats/entities/chat.entity';
import { MessageResponse } from '../messages/dto/message.response';
import { RequestResponse } from '../friends/dto/request.response';
import { UserResponse } from '../friends/dto/user.response';

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
   * Emits a "newMessage" event
   * @param room The id of the room
   * @param message The new message
   */
  sendMessage(room: string, message: MessageResponse) {
    this.server.to(room).emit('newMessage', message);
  }

  /**
   * Emits an "editMessage" event
   * @param room The id of the room
   * @param message The edited message
   */
  editMessage(room: string, message: MessageResponse) {
    this.server.to(room).emit('editMessage', message);
  }

  /**
   * Emits a "deleteMessage" event
   * @param room The id of the room
   * @param id The id of the deleted message
   */
  deleteMessage(room: string, id: string) {
    this.server.to(room).emit('deleteMessage', id);
  }

  /**
   * Emits an "addToTyping" event
   * @param room
   * @param username
   */
  addTyping(room: string, username: string) {
    this.server.to(room).emit('addToTyping', username);
  }

  /**
   * Emits an "removeFromTyping" event
   * @param room
   * @param username
   */
  stopTyping(room: string, username: string) {
    this.server.to(room).emit('removeFromTyping', username);
  }

  /**
   * Emits an "sendRequest" event
   * @param room
   */
  sendRequest(room: string) {
    this.server.to(room).emit('sendRequest');
  }

  /**
   * Emits an "addRequest" event
   * @param room
   * @param request
   */
  addRequest(room: string, request: RequestResponse) {
    this.sendRequest(room);
    this.server.to(room).emit('addRequest', request);
  }

  /**
   * Emits an "addFriend" event
   * @param current
   * @param friend
   */
  addFriend(current: UserResponse, friend: UserResponse) {
    this.server.to(friend.id).emit('addFriend', current);
    this.server.to(current.id).emit('addFriend', friend);
  }

  /**
   * Emits an "removeFriend" event
   * @param userId
   * @param friendId
   */
  removeFriend(userId: string, friendId: string) {
    this.server.to(userId).emit('removeFriend', friendId);
    this.server.to(friendId).emit('removeFriend', userId);
  }
}
