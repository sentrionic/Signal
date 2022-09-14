import { Entity, ManyToOne, OneToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { User } from '../../users/entities/user.entity';
import { Attachment } from './attachment.entity';
import { Chat } from '../../chats/entities/chat.entity';
import { Group } from '../../groups/entities/group.entity';
import { MessageType } from './message-type.enum';

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

  constructor(user: User, type: MessageType) {
    this.id = v4();
    this.user = user;
    this.type = type;
  }
}
