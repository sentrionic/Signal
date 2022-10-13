import { Entity, Index, PrimaryKey, Property } from '@mikro-orm/core';
import { UserResponse } from '../dto/user.response';

@Entity()
export class User {
  @PrimaryKey()
  id: string;

  @Property({ unique: true })
  @Index()
  username: string;

  @Property()
  displayName: string;

  @Property()
  bio: string;

  @Property()
  image: string;

  @Property({ version: true })
  version!: number;

  @Property({ type: 'date' })
  lastOnline: Date;

  constructor(id: string, username: string, bio: string, displayName: string, image: string) {
    this.id = id;
    this.displayName = displayName;
    this.username = username;
    this.bio = bio;
    this.image = image;
    this.lastOnline = new Date();
  }

  toUserResponse(): UserResponse {
    return {
      id: this.id,
      username: this.username,
      displayName: this.displayName,
      image: this.image,
      bio: this.bio,
      lastOnline: this.lastOnline.toISOString(),
    };
  }
}
