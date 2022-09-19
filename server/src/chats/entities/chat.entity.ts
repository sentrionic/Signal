import {
  Collection,
  Entity,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { v4 } from 'uuid';
import { ChatResponse } from '../dto/chat.response';
import { User } from '../../users/entities/user.entity';
import { UserResponse } from '../../friends/dto/user.response';
import { ChatType } from './chat-type.enum';
import { Group } from '../../groups/entities/group.entity';
import { Message } from '../../messages/entities/message.entity';
import { MessageType } from '../../messages/entities/message-type.enum';

@Entity()
export class Chat {
  @PrimaryKey()
  id: string;

  @ManyToMany(() => User)
  members: Collection<User> = new Collection<User>(this);

  @Property()
  type: ChatType;

  @OneToOne(() => Group, (group) => group.chat, {
    owner: true,
    orphanRemoval: true,
    onDelete: 'cascade',
    nullable: true,
  })
  group?: Group | null;

  @OneToMany(() => Message, (message) => message.chat)
  messages: Collection<Message> = new Collection<Message>(this);

  constructor(type: ChatType) {
    this.id = v4();
    this.type = type;
  }

  toChatResponse(user?: UserResponse | null): ChatResponse {
    const message = this.messages.getItems().at(-1);
    return {
      id: this.id,
      type: this.type,
      user,
      group: this.group?.toGroupResponse(this.members.count()) || null,
      lastMessage: this.getLastMessage(message),
    };
  }

  getLastMessage(message?: Message): string | null {
    if (!message) return null;
    switch (message.type) {
      case MessageType.TEXT:
        return message.text ?? null;
      case MessageType.IMAGE:
        return message.attachment?.filename ?? 'Sent a file';
      default:
        return null;
    }
  }
}
