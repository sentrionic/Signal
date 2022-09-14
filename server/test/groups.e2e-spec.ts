// noinspection TypeScriptValidateJSTypes

import { NestExpressApplication } from '@nestjs/platform-express';
import { TestAppService } from './app.service';
import { EntityManager } from '@mikro-orm/core';
import * as request from 'supertest';
import { login } from './helpers';
import { User } from '../src/users/entities/user.entity';
import { Group } from '../src/groups/entities/group.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { ConfigSchema } from '../src/common/schema/config.schema';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { UsersModule } from '../src/users/users.module';
import { GroupsModule } from '../src/groups/groups.module';
import { setupApp } from '../src/app';
import { getRandomString } from '../src/common/utils/faker';

describe('GroupsController (e2e)', () => {
  let app: NestExpressApplication;
  let service: TestAppService;
  let server: any;
  let em: EntityManager;
  let current: User;
  let group: Group;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: '.env.test',
          validationSchema: ConfigSchema,
        }),
        MikroOrmModule.forRoot(),
        UsersModule,
        GroupsModule,
      ],
      controllers: [],
      providers: [TestAppService],
    }).compile();

    app = moduleFixture.createNestApplication<NestExpressApplication>();
    service = app.get<TestAppService>(TestAppService);
    em = service.getEntityManager().fork();

    await setupApp(app);

    current = new User('test@example.com', 'Test', 'password');
    group = new Group('Group');
    group.members.add(current);
    await em.persistAndFlush([current, group]);

    await app.init();
    server = app.getHttpServer();
  });

  describe('[GROUPS] - /api/groups/ (GET)', () => {
    // Seed DB with chats
    beforeEach(async () => {
      const groups: Group[] = [];
      const users: User[] = [];

      for (let i = 0; i < 10; i++) {
        const u = new User(`user-${i}@example.com`, `User #${i}`, 'password');
        const g = new Group(getRandomString());
        g.members.add(u);
        if (i % 2 === 0) g.members.add(current);
        groups.push(g);
        users.push(u);
      }

      await em.persistAndFlush([...users, current, ...groups]);
    });

    it('should successfully return a list of groups for the current user', async () => {
      const session = await login(server, current);

      const { body, status } = await request(server).get('/api/groups').set('Cookie', session);
      expect(status).toEqual(200);
      expect(body.length).toEqual(6);

      const group = body.at(1);
      expect(group).toBeDefined();
      expect(group?.id).toBeDefined();
      expect(group?.name).toBeDefined();
      expect(group?.image).toBeDefined();
      expect(group?.memberCount).toEqual(2);
    });

    it('should throw an UnauthorizedException when no session is provided', async () => {
      const { status } = await request(server).get('/api/groups');
      expect(status).toEqual(403);
    });
  });

  describe('[CREATE_GROUP] - /api/groups/ (POST)', () => {
    it('should successfully create and return the new group', async () => {
      const session = await login(server, current);
      const name = getRandomString();

      const { body, status } = await request(server)
        .post('/api/groups')
        .set('Cookie', session)
        .send({ name });
      expect(status).toEqual(201);

      expect(body).toBeDefined();
      expect(body?.id).toBeDefined();
      expect(body?.name).toEqual(name);
      expect(body?.image).toBeDefined();
      expect(body?.memberCount).toEqual(1);
    });

    it('should throw an UnauthorizedException when no session is provided', async () => {
      const name = getRandomString();
      const { status } = await request(server).post('/api/groups').send({ name });
      expect(status).toEqual(403);
    });
  });

  describe('[ADD_USER_TO_GROUP] - /api/groups/:groupID (POST)', () => {
    it('should successfully add the given user to the group', async () => {
      const user = new User('contact@example.com', 'Contact', 'password');
      await em.persistAndFlush(user);

      const session = await login(server, current);

      const { body, status } = await request(server)
        .post(`/api/groups/${group.id}`)
        .set('Cookie', session)
        .send({ username: user.username });
      expect(status).toEqual(201);
      expect(body).toBeTruthy();
    });

    it('should throw an UnauthorizedException when no session is provided', async () => {
      const { status } = await request(server)
        .post(`/api/groups/${group.id}`)
        .send({ username: 'username' });
      expect(status).toEqual(403);
    });
  });

  describe('[LEAVE_GROUP] - /api/groups/:groupID (DELETE)', () => {
    it('should successfully leave the given group', async () => {
      const session = await login(server, current);

      const { body, status } = await request(server)
        .delete(`/api/groups/${group.id}`)
        .set('Cookie', session);
      expect(status).toEqual(200);
      expect(body).toBeTruthy();
    });

    it('should throw an UnauthorizedException when no session is provided', async () => {
      const { status } = await request(server).delete(`/api/groups/${group.id}`);
      expect(status).toEqual(403);
    });
  });

  afterEach(async () => {
    await service.clearDatabase();
    await app.close();
    server.close();
  });
});
