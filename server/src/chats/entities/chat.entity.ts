import { Collection, Entity, OneToMany, OneToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { ChatResponse } from '../dto/chat.response';
import { UserResponse } from '../../friends/dto/user.response';
import { ChatType } from './chat-type.enum';
import { Group } from '../../groups/entities/group.entity';
import { Message } from '../../messages/entities/message.entity';
import { ChatMember } from './member.entity';

@Entity()
export class Chat {
  @PrimaryKey()
  id: string;

  @OneToMany(() => ChatMember, (m) => m.chat)
  members = new Collection<ChatMember>(this);

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

  toChatResponse(current: ChatMember, user?: UserResponse | null): ChatResponse {
    return {
      id: this.id,
      type: this.type,
      user,
      group: this.group?.toGroupResponse(this.members.count()) || null,
      lastMessage: this.messages.getItems().at(-1)?.toResponse() || null,
      hasNotification: this.messages.getItems().some((m) => m.sentAt > current.lastSeen),
    };
  }
}
