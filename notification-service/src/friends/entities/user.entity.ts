import { Collection, Entity, ManyToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { Chat } from '../../chats/entities/chat.entity';

@Entity()
export class User {
  @PrimaryKey()
  id: string;

  @Property({ version: true })
  version!: number;

  @ManyToMany()
  friends = new Collection<User>(this);

  @ManyToMany(() => Chat, (chat) => chat.members)
  chats = new Collection<Chat>(this);

  constructor(id: string) {
    this.id = id;
  }
}
