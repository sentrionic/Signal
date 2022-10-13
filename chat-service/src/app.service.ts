import { Injectable, OnModuleInit } from '@nestjs/common';
import { MikroORM } from '@mikro-orm/core';
import { User } from './users/entities/user.entity';

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
    const user1 = new User(
      '1ad7a449-abdf-48e9-8262-e6071fca9540',
      'Sen#0000',
      '',
      'Sen',
      `https://gravatar.com/avatar/b8abd16496a669abb69ad275a0b0103c?d=identicon`,
    );
    const user2 = new User(
      '4e18d808-1a8e-46b9-a2d3-6d752e5396db',
      'Felsa#0000',
      '',
      'Felsa',
      `https://gravatar.com/avatar/d67387330292f61f30cc3ceba990a9dc?d=identicon`,
    );
    const user3 = new User(
      'bc901c34-5ba7-4477-bc2d-a93b80ce5f34',
      'Bel#0000',
      '',
      'Bel',
      `https://gravatar.com/avatar/7d9a83955e83939fa1216b26ae5cf5a2?d=identicon`,
    );

    await em.persistAndFlush([user1, user2, user3]);
  }
}
