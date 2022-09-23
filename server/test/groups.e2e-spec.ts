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
import { Chat } from '../src/chats/entities/chat.entity';
import { ChatType } from '../src/chats/entities/chat-type.enum';
import { ChatMember } from '../src/chats/entities/member.entity';

describe('GroupsController (e2e)', () => {
  let app: NestExpressApplication;
  let service: TestAppService;
  let server: any;
  let em: EntityManager;
  let current: User;
  let group: Group;
  let chat: Chat;

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
    chat = new Chat(ChatType.GROUP_CHAT);
    group = new Group('Group');
    chat.group = group;
    chat.members.add(new ChatMember(current, chat));
    await em.persistAndFlush([current, chat, group]);

    await app.init();
    server = app.getHttpServer();
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
      expect(body?.group).toBeDefined();
      expect(body?.type).toEqual(ChatType.GROUP_CHAT);
      expect(body?.group.id).toBeDefined();
      expect(body?.group.name).toEqual(name);
      expect(body?.group.image).toBeDefined();
      expect(body?.group.memberCount).toEqual(1);
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
        .post(`/api/groups/${chat.id}`)
        .set('Cookie', session)
        .send({ username: user.username });
      expect(status).toEqual(201);
      expect(body).toBeTruthy();
    });

    it('should throw an UnauthorizedException when no session is provided', async () => {
      const { status } = await request(server)
        .post(`/api/groups/${chat.id}`)
        .send({ username: 'username' });
      expect(status).toEqual(403);
    });
  });

  describe('[LEAVE_GROUP] - /api/groups/:groupID (DELETE)', () => {
    it('should successfully leave the given group', async () => {
      const session = await login(server, current);

      const { body, status } = await request(server)
        .delete(`/api/groups/${chat.id}`)
        .set('Cookie', session);
      expect(status).toEqual(200);
      expect(body).toBeTruthy();
    });

    it('should throw an UnauthorizedException when no session is provided', async () => {
      const { status } = await request(server).delete(`/api/groups/${chat.id}`);
      expect(status).toEqual(403);
    });
  });

  afterEach(async () => {
    await service.clearDatabase();
    await app.close();
    server.close();
  });
});
