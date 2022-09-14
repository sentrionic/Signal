import { Collection, Entity, ManyToMany, PrimaryKey } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { ChatResponse } from '../dto/chat.response';
import { User } from '../../users/entities/user.entity';
import { UserResponse } from '../../friends/dto/user.response';

@Entity()
export class Chat {
  @PrimaryKey()
  id: string;

  @ManyToMany(() => User)
  members: Collection<User> = new Collection<User>(this);

  constructor() {
    this.id = v4();
  }

  toChatResponse(contact: UserResponse): ChatResponse {
    return {
      id: this.id,
      user: contact,
    };
  }
}
