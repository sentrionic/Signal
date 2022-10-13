import { Injectable, OnModuleInit } from '@nestjs/common';
import { MikroORM } from '@mikro-orm/core';
import { User } from './friends/entities/user.entity';

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
    const user1 = new User('1ad7a449-abdf-48e9-8262-e6071fca9540');
    const user2 = new User('4e18d808-1a8e-46b9-a2d3-6d752e5396db');
    const user3 = new User('bc901c34-5ba7-4477-bc2d-a93b80ce5f34');

    // Add as contacts
    user1.friends.add(user2);
    user2.friends.add(user1);
    user1.friends.add(user3);
    user3.friends.add(user1);

    await em.persistAndFlush([user1, user2, user3]);
  }
}
