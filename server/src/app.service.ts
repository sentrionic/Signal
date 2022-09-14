import { Injectable, OnModuleInit } from '@nestjs/common';
import { MikroORM } from '@mikro-orm/core';
import { User } from './users/entities/user.entity';
import { Group } from './groups/entities/group.entity';
import { Chat } from './chats/entities/chat.entity';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(private readonly orm: MikroORM) {}

  async onModuleInit() {
    const generator = this.orm.getSchemaGenerator();
    await generator.updateSchema();

    if (process.env.NODE_ENV === 'development') {
      await this.seedDatabase();
    }
  }

  async seedDatabase(): Promise<void> {
    const em = this.orm.em.fork();

    if ((await em.count(User)) > 0) return;

    // Add users
    const user1 = new User('sen@example.com', 'Sen', 'password');
    const user2 = new User('felsa@example.com', 'Felsa', 'password');
    const user3 = new User('dan@example.com', 'Dan', 'password');

    // Create group
    const group = new Group('Group #1');
    group.members.add(user1, user2);

    // Create chat
    const chat = new Chat();
    chat.members.add(user1, user3);

    await em.persistAndFlush([user1, user2, user3, group, chat]);
  }
}
