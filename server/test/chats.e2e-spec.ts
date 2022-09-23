// noinspection TypeScriptValidateJSTypes

import { NestExpressApplication } from '@nestjs/platform-express';
import { TestAppService } from './app.service';
import { EntityManager } from '@mikro-orm/core';
import { User } from '../src/users/entities/user.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { ConfigSchema } from '../src/common/schema/config.schema';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { setupApp } from '../src/app';
import { ChatsModule } from '../src/chats/chats.module';
import * as request from 'supertest';
import { login } from './helpers';
import { Chat } from '../src/chats/entities/chat.entity';
import { ChatResponse } from '../src/chats/dto/chat.response';
import { UsersModule } from '../src/users/users.module';
import { ChatType } from '../src/chats/entities/chat-type.enum';
import { Group } from '../src/groups/entities/group.entity';
import { ChatMember } from '../src/chats/entities/member.entity';
import { Message } from '../src/messages/entities/message.entity';

describe('ChatsController (e2e)', () => {
  let app: NestExpressApplication;
  let service: TestAppService;
  let server: any;
  let em: EntityManager;
  let current: User;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: '.env.test',
          validationSchema: ConfigSchema,
        }),
        MikroOrmModule.forRoot(),
        UsersModule,
        ChatsModule,
      ],
      controllers: [],
      providers: [TestAppService],
    }).compile();

    app = moduleFixture.createNestApplication<NestExpressApplication>();
    service = app.get<TestAppService>(TestAppService);
    em = service.getEntityManager().fork();

    await setupApp(app);

    current = new User('test@example.com', 'Test', 'password');
    await em.persistAndFlush([current]);

    await app.init();
    server = app.getHttpServer();
  });

  describe('[CHATS] - /api/chats/ (GET)', () => {
    // Seed DB with chats
    beforeEach(async () => {
      const chats: Chat[] = [];
      const users: User[] = [];

      for (let i = 0; i < 10; i++) {
        const u = new User(`user-${i}@example.com`, `User #${i}`, 'password');
        const c = i % 3 === 0 ? new Chat(ChatType.GROUP_CHAT) : new Chat(ChatType.DIRECT_CHAT);
        if (i % 2 === 0) {
          c.members.add(new ChatMember(current, c));
        }
        c.members.add(new ChatMember(u, c));

        const message = new Message(u, c);
        message.text = `Text Message #${i}`;
        // Add some difference for cursor
        message.sentAt.setMinutes(message.sentAt.getMinutes() + i);
        c.messages.add(message);

        if (c.type === ChatType.GROUP_CHAT) {
          c.group = new Group(`Group #${i}`);
        }

        chats.push(c);
        users.push(u);
      }

      await em.persistAndFlush([...users, ...chats]);
    });

    it('should successfully return a list of chats for the current user', async () => {
      const session = await login(server, current);

      const { body, status } = await request(server).get('/api/chats').set('Cookie', session);
      expect(status).toEqual(200);
      expect(body.length).toEqual(5);

      const result = body as ChatResponse[];

      const directChat = result[0];
      expect(directChat.id).toBeDefined();
      expect(directChat.type).toEqual(ChatType.DIRECT_CHAT);
      const user = directChat?.user;
      expect(user).toBeDefined();
      expect(user?.id).toBeDefined();
      expect(user?.username).toBeDefined();
      expect(user?.displayName).toBeDefined();
      expect(user?.image).toBeDefined();
      expect(user?.bio).toBeDefined();
      expect(user?.lastOnline).toBeDefined();

      const groupChat = result[1];
      expect(groupChat.id).toBeDefined();
      expect(groupChat.type).toEqual(ChatType.GROUP_CHAT);
      const group = groupChat?.group;
      expect(group).toBeDefined();
      expect(group?.id).toBeDefined();
      expect(group?.name).toBeDefined();
      expect(group?.image).toBeDefined();
      expect(group?.memberCount).toEqual(2);
    });

    it('should throw an UnauthorizedException when no session is provided', async () => {
      const { status } = await request(server).get('/api/chats');
      expect(status).toEqual(403);
    });
  });

  describe('[GET_OR_CREATE_CHAT] - /api/chats/ (POST)', () => {
    it('should successfully return the chat between the two users if it already exists', async () => {
      const contact = new User('contact@example.com', 'Contact', 'password');
      const chat = new Chat(ChatType.DIRECT_CHAT);
      chat.members.add(new ChatMember(contact, chat));
      chat.members.add(new ChatMember(current, chat));
      await em.persistAndFlush([chat, contact]);

      const session = await login(server, current);

      const { body, status } = await request(server)
        .post('/api/chats')
        .set('Cookie', session)
        .send({ contactID: contact.id });
      expect(status).toEqual(201);
      expect(body.id).toBeDefined();
      expect(body.type).toEqual(ChatType.DIRECT_CHAT);

      const user = body.user;

      expect(user?.id).toEqual(contact.id);
      expect(user?.username).toEqual(contact.username);
      expect(user?.displayName).toEqual(contact.displayName);
      expect(user?.image).toEqual(contact.image);
      expect(user?.bio).toEqual(contact.bio);
      expect(user?.lastOnline).toBeDefined();

      // Confirm the user has a chat now
      const response = await request(server).get('/api/chats').set('Cookie', session);
      expect(response.status).toEqual(200);
      expect(response.body[0].user.id).toEqual(contact.id);
    });

    it('should successfully create and return the chat between the two users if it did not exist beforehand', async () => {
      const contact = new User('contact@example.com', 'Contact', 'password');
      await em.persistAndFlush([contact]);

      const session = await login(server, current);

      const { body, status } = await request(server)
        .post('/api/chats')
        .set('Cookie', session)
        .send({ contactID: contact.id });
      expect(status).toEqual(201);
      expect(body.id).toBeDefined();
      expect(body.type).toEqual(ChatType.DIRECT_CHAT);

      const user = body.user;

      expect(user?.id).toEqual(contact.id);
      expect(user?.username).toEqual(contact.username);
      expect(user?.displayName).toEqual(contact.displayName);
      expect(user?.image).toEqual(contact.image);
      expect(user?.bio).toEqual(contact.bio);
      expect(user?.lastOnline).toBeDefined();

      // Confirm the user has a chat now
      const response = await request(server).get('/api/chats').set('Cookie', session);
      expect(response.status).toEqual(200);
      expect(response.body[0].user.id).toEqual(contact.id);
    });

    it('should throw an UnauthorizedException when no session is provided', async () => {
      const { status } = await request(server).post('/api/chats').send({ contactID: 'no' });
      expect(status).toEqual(403);
    });
  });

  afterEach(async () => {
    await service.clearDatabase();
    await app.close();
    server.close();
  });
});
