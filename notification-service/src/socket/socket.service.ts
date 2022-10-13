import { MikroORM, UseRequestContext } from '@mikro-orm/core';
import { Inject, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import {
  ChatResponse,
  ChatUpdateLastSeenEvent,
  MessageResponse,
  RequestResponse,
  Services,
  Subjects,
  UserResponse,
} from '@senorg/common';
import { Server, Socket } from 'socket.io';
import { getSessionId } from '../common/utils/getSessionId';
import { ClientProxy } from '@nestjs/microservices';
import { Chat } from '../chats/entities/chat.entity';
import { User } from '../friends/entities/user.entity';

@Injectable()
export class SocketService {
  private socket: Server | null = null;

  private get server(): Server {
    if (!this.socket) throw new WsException({ message: 'Server not initialized' });
    return this.socket;
  }

  constructor(
    private readonly orm: MikroORM,
    @Inject(Services.Chat) private readonly chatClient: ClientProxy,
  ) {}

  setupSocket(socket: Server): void {
    this.socket = socket;
  }

  /**
   * Joins the given room if the user is a member of the room
   * @param client
   * @param room
   */
  @UseRequestContext()
  async joinChat(client: Socket, room: string): Promise<void> {
    const id = getSessionId(client);
    const chat = await this.orm.em.findOne(Chat, { id: room }, { populate: ['members'] });

    if (!chat) {
      throw new WsException('Not Found');
    }

    if (!chat.members.getItems().find((m) => m.id === id)) {
      throw new WsException('Not Authorized');
    }

    client.join(room);
    await this.updateLastOnline(client);
  }

  /**
   * Emits a "newMessage" event
   * @param room The id of the room
   * @param message The new message
   */
  sendMessage(room: string, message: MessageResponse): void {
    this.server.to(room).emit('newMessage', message);
    this.sendNotification(room, message);
  }

  /**
   * Emits an "editMessage" event
   * @param room The id of the room
   * @param message The edited message
   */
  editMessage(room: string, message: MessageResponse): void {
    this.server.to(room).emit('editMessage', message);
  }

  /**
   * Emits a "deleteMessage" event
   * @param room The id of the room
   * @param id The id of the deleted message
   */
  deleteMessage(room: string, id: string): void {
    this.server.to(room).emit('deleteMessage', id);
  }

  /**
   * Emits an "addToTyping" event
   * @param room
   * @param username
   */
  addTyping(room: string, username: string): void {
    this.server.to(room).emit('addToTyping', username);
  }

  /**
   * Emits an "removeFromTyping" event
   * @param room
   * @param username
   */
  stopTyping(room: string, username: string): void {
    this.server.to(room).emit('removeFromTyping', username);
  }

  /**
   * Emits an "addRequest" event
   * @param room
   * @param request
   */
  addRequest(room: string, request: RequestResponse): void {
    this.server.to(room).emit('addRequest', request);
  }

  /**
   * Emits an "addFriend" event
   * @param current
   * @param friend
   */
  addFriend(current: UserResponse, friend: UserResponse): void {
    this.server.to(friend.id).emit('addFriend', current);
    this.server.to(current.id).emit('addFriend', friend);
  }

  /**
   * Emits an "removeFriend" event
   * @param userId
   * @param friendId
   */
  removeFriend(userId: string, friendId: string): void {
    this.server.to(userId).emit('removeFriend', friendId);
    this.server.to(friendId).emit('removeFriend', userId);
  }

  /**
   * Emits an "sendChat" event
   * @param room The id of the user that was added
   * @param chat The new chat
   */
  sendChat(room: string, chat: ChatResponse): void {
    this.server.to(room).emit('sendChat', chat);
  }

  /**
   * Emits an "addMember" event
   * @param room The id of the room
   * @param user The new user
   */
  addMember(room: string, user: UserResponse): void {
    this.server.to(room).emit('addMember', user);
  }

  /**
   * Emits a "removeMember" event
   * @param room The id of the room
   * @param userId The id of the user
   */
  removeMember(room: string, userId: string): void {
    this.server.to(room).emit('removeMember', userId);
  }

  @UseRequestContext()
  async sendNotification(chatId: string, message: MessageResponse): Promise<void> {
    const chat = await this.orm.em.findOne(Chat, { id: chatId }, { populate: ['members.id'] });

    for (const member of chat.members) {
      this.server.to(member.id).emit('newNotification', chatId, message);
    }
  }

  /**
   * Set the user's lastOnline status
   * @param client
   */
  async updateLastOnline(client: Socket): Promise<void> {
    const id = getSessionId(client);
    const user = await this.orm.em.findOne(User, { id }, { populate: ['friends'] });

    if (!user) return;

    const now = new Date();

    this.chatClient.emit(Subjects.UserUpdateLastOnline, id);

    // Send the new date to all friends
    for (const friend of user.friends) {
      this.server.to(friend.id).emit('updateLastSeen', id, now.toISOString());
    }
  }

  async updateLastSeen(client: Socket, room: string): Promise<void> {
    const id = getSessionId(client);
    this.chatClient.emit(Subjects.ChatUpdateLastSeen, new ChatUpdateLastSeenEvent(id, room));
  }
}
