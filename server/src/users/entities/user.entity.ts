import { BeforeCreate, BeforeUpdate, Entity, Index, PrimaryKey, Property } from '@mikro-orm/core';
import * as md5 from 'md5';
import { v4 } from 'uuid';
import * as argon2 from 'argon2';
import { Account } from '../dto/account.response';

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
