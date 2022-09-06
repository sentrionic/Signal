import { Injectable, OnModuleInit } from '@nestjs/common';
import { EntityManager, MikroORM } from '@mikro-orm/core';

@Injectable()
export class TestAppService implements OnModuleInit {
  constructor(private readonly orm: MikroORM) {}

  async onModuleInit() {
    const generator = this.orm.getSchemaGenerator();
    await generator.updateSchema();
  }

  async clearDatabase() {
    const generator = this.orm.getSchemaGenerator();
    await generator.refreshDatabase();
  }

  getEntityManager(): EntityManager {
    return this.orm.em;
  }
}
