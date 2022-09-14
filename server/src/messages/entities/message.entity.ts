import { Entity, ManyToOne, OneToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { User } from '../../users/entities/user.entity';
import { Attachment } from './attachment.entity';
import { Chat } from '../../chats/entities/chat.entity';
import { Group } from '../../groups/entities/group.entity';
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
  chat?: Chat;

  @ManyToOne({ nullable: true })
  group?: Group;

  @ManyToOne()
  user: User;

  @OneToOne(() => Attachment, (attachment) => attachment.message, {
    nullable: true,
  })
  attachment?: Attachment;

  @Property({ type: 'date' })
  sentAt = new Date();

  @Property({ type: 'date' })
  deliveredAt?: Date;

  @Property({ type: 'date' })
  seenAt?: Date;

  constructor(user: User) {
    this.id = v4();
    this.user = user;
    this.type = MessageType.TEXT;
  }

  toResponse(): MessageResponse {
    return {
      id: this.id,
      type: this.type,
      attachment: this.attachment?.toResponse(),
      deliveredAt: this.deliveredAt?.toISOString(),
      sentAt: this.sentAt.toISOString(),
      seenAt: this.seenAt?.toISOString(),
      user: this.user.toUserResponse(),
    };
  }
}
