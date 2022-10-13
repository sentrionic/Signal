import { Entity, OneToOne, PrimaryKey, Property } from '@mikro-orm/core';
import * as md5 from 'md5';
import { v4 } from 'uuid';
import { GroupResponse } from '../dto/group.response';
import { Chat } from '../../chats/entities/chat.entity';

@Entity()
export class Group {
  @PrimaryKey()
  id: string;

  @Property()
  name: string;

  @Property()
  image: string;

  @Property({ type: 'date' })
  createdAt = new Date();

  @OneToOne(() => Chat, (chat) => chat.group)
  chat!: Chat;

  constructor(name: string) {
    this.id = v4();
    this.name = name;
    this.image = this.generateImage(name);
  }

  // Gets a gravatar for the given name's hash
  private generateImage(name: string): string {
    return `https://gravatar.com/avatar/${md5(name)}?d=identicon`;
  }

  toGroupResponse(memberCount: number): GroupResponse {
    return {
      id: this.id,
      name: this.name,
      image: this.image,
      createdAt: this.createdAt.toISOString(),
      memberCount,
    };
  }
}
