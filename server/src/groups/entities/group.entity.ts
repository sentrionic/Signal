import { Collection, Entity, ManyToMany, PrimaryKey, Property } from '@mikro-orm/core';
import * as md5 from 'md5';
import { v4 } from 'uuid';
import { User } from '../../users/entities/user.entity';
import { GroupResponse } from '../dto/group.response';

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

  @ManyToMany({
    entity: () => User,
    inversedBy: (u) => u.groups,
    owner: true,
    pivotTable: 'user_to_groups',
    joinColumn: 'group_id',
    inverseJoinColumn: 'user_id',
    hidden: true,
  })
  members = new Collection<User>(this);

  constructor(name: string) {
    this.id = v4();
    this.name = name;
    this.image = this.generateImage(name);
  }

  // Gets a gravatar for the given name's hash
  private generateImage(name: string): string {
    return `https://gravatar.com/avatar/${md5(name)}?d=identicon`;
  }

  toGroupResponse(): GroupResponse {
    return {
      id: this.id,
      name: this.name,
      image: this.image,
      createdAt: this.createdAt.toISOString(),
      memberCount: this.members.count(),
    };
  }
}
