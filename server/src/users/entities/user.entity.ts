import {
  BeforeCreate,
  BeforeUpdate,
  Collection,
  Entity,
  Index,
  ManyToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import * as md5 from 'md5';
import { v4 } from 'uuid';
import * as argon2 from 'argon2';
import { Account } from '../dto/account.response';
import { UserResponse } from '../../friends/dto/user.response';
import { Group } from '../../groups/entities/group.entity';

@Entity()
export class User {
  @PrimaryKey()
  id: string;

  @Property({ unique: true })
  @Index()
  username: string;

  @Property({ unique: true })
  @Index()
  email: string;

  @Property()
  displayName: string;

  @Property()
  bio: string;

  @Property()
  image: string;

  @Property({ hidden: true })
  password: string;

  @Property({ type: 'date' })
  createdAt = new Date();

  @Property({ type: 'date' })
  lastOnline = new Date();

  @ManyToMany({
    entity: () => User,
    inversedBy: (u) => u.incomingRequests,
    owner: true,
    pivotTable: 'user_to_request',
    joinColumn: 'sender',
    inverseJoinColumn: 'receiver',
    hidden: true,
  })
  outgoingRequests = new Collection<User>(this);

  @ManyToMany(() => User, (u) => u.outgoingRequests, { hidden: true })
  incomingRequests = new Collection<User>(this);

  @ManyToMany({ hidden: true })
  friends = new Collection<User>(this);

  @ManyToMany(() => Group, (g) => g.members, { hidden: true })
  groups = new Collection<Group>(this);

  constructor(email: string, displayName: string, password: string) {
    this.id = v4();
    this.displayName = displayName;
    this.email = email;
    this.password = password;
    this.image = this.generateImage(email);
    this.username = this.generateUsername(displayName);
    this.bio = '';
  }

  async isPasswordValid(password: string): Promise<boolean> {
    return await argon2.verify(this.password, password);
  }

  toAccount(): Account {
    return {
      id: this.id,
      email: this.email,
      username: this.username,
      displayName: this.displayName,
      image: this.image,
      bio: this.bio,
    };
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

  @BeforeCreate()
  // @ts-ignore
  private async hashPassword(): Promise<void> {
    this.password = await argon2.hash(this.password);
  }

  // Gets a gravatar for the given email's hash
  private generateImage(email: string): string {
    return `https://gravatar.com/avatar/${md5(email)}?d=identicon`;
  }

  @BeforeUpdate()
  // @ts-ignore
  private updateUsername(): void {
    this.username = this.generateUsername(this.displayName);
  }

  private generateUsername(displayName: string): string {
    return `${displayName}#${this.getTag()}`;
  }

  // Generates a four digit long random string tag
  private getTag(): string {
    const characters = '0123456789';
    return [...Array(4)].map((_) => characters[~~(Math.random() * characters.length)]).join('');
  }
}
