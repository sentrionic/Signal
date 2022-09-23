import { Entity, ManyToOne, Property } from '@mikro-orm/core';
import { User } from '../../users/entities/user.entity';
import { Chat } from './chat.entity';

@Entity()
export class ChatMember {
  @ManyToOne({ primary: true })
  user: User;

  @ManyToOne({ primary: true })
  chat: Chat;

  @Property({ type: 'date' })
  lastSeen: Date = new Date();

  constructor(user: User, chat: Chat) {
    this.user = user;
    this.chat = chat;
  }
}
