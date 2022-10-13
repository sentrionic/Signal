import { Entity, ManyToOne, OneToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { User } from '../../users/entities/user.entity';
import { Attachment } from './attachment.entity';
import { Chat } from '../../chats/entities/chat.entity';
import { MessageType } from './message-type.enum';
import { MessageResponse } from '../dto/message.response';

@Entity()
export class Message {
  @PrimaryKey()
  id: string;

  @Property()
  type: MessageType;

  @Property({ nullable: true, type: 'text' })
  text?: string;

  @ManyToOne({ nullable: true })
  chat: Chat;

  @ManyToOne()
  user: User;

  @OneToOne(() => Attachment, (attachment) => attachment.message, {
    owner: true,
    orphanRemoval: true,
    onDelete: 'cascade',
    nullable: true,
  })
  attachment?: Attachment;

  @Property({ type: 'date' })
  sentAt: Date;

  @Property({ type: 'date' })
  updatedAt: Date;

  @Property({ type: 'date' })
  deliveredAt?: Date;

  @Property({ type: 'date' })
  seenAt?: Date;

  constructor(user: User, chat: Chat) {
    this.id = v4();
    this.user = user;
    this.type = MessageType.TEXT;
    this.chat = chat;

    const now = new Date();
    this.sentAt = now;
    this.updatedAt = now;
  }

  toResponse(): MessageResponse {
    return {
      id: this.id,
      text: this.text || null,
      type: this.type,
      attachment: this.attachment?.toResponse() || null,
      deliveredAt: this.deliveredAt?.toISOString(),
      sentAt: this.sentAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      seenAt: this.seenAt?.toISOString(),
      user: this.user.toUserResponse(),
    };
  }
}
