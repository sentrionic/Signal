import { Collection, Entity, ManyToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { User } from '../../friends/entities/user.entity';

@Entity()
export class Chat {
  @PrimaryKey()
  id: string;

  @Property({ version: true })
  version!: number;

  @ManyToMany({ hidden: true })
  members = new Collection<User>(this);

  constructor(id: string) {
    this.id = id;
  }
}
