// noinspection TypeScriptValidateJSTypes

import { NestExpressApplication } from '@nestjs/platform-express';
import { TestAppService } from './app.service';
import { EntityManager } from '@mikro-orm/core';
import { User } from '../src/users/entities/user.entity';
import { Message } from '../src/messages/entities/message.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { ConfigSchema } from '../src/common/schema/config.schema';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { UsersModule } from '../src/users/users.module';
import { setupApp } from '../src/app';
import { MessagesModule } from '../src/messages/messages.module';
import { Chat } from '../src/chats/entities/chat.entity';
import { ChatType } from '../src/chats/entities/chat-type.enum';
import { login } from './helpers';
import * as request from 'supertest';
import { MessageResponse } from '../src/messages/dto/message.response';
import { MessageType } from '../src/messages/entities/message-type.enum';

describe('MessagesController (e2e)', () => {
  let app: NestExpressApplication;
  let service: TestAppService;
  let server: any;
  let em: EntityManager;
  let current: User;
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
        MessagesModule,
      ],
      controllers: [],
      providers: [TestAppService],
    }).compile();

    app = moduleFixture.createNestApplication<NestExpressApplication>();
    service = app.get<TestAppService>(TestAppService);
    em = service.getEntityManager().fork();

    await setupApp(app);

    current = new User('test@example.com', 'Test', 'password');
    chat = new Chat(ChatType.DIRECT_CHAT);
    chat.members.add(current);
    await em.persistAndFlush([current, chat]);

    await app.init();
    server = app.getHttpServer();
  });

  describe('[MESSAGES] - /api/messages/:chatId (GET)', () => {
    // Seed DB with chats
    let messages: Message[] = [];
    beforeEach(async () => {
      messages = [];

      for (let i = 0; i < 10; i++) {
        const u = new User(`user-${i}@example.com`, `User #${i}`, 'password');
        const message = new Message(i % 2 === 0 ? u : current);
        message.text = `Text Message #${i}`;
        message.chat = chat;
        // Add some difference for cursor
        message.sentAt.setMinutes(message.sentAt.getMinutes() + i);
        messages.push(message);
      }

      await em.persistAndFlush(messages);
    });

    it('should successfully return a list of messages for the given chatId', async () => {
      const session = await login(server, current);

      const { body, status } = await request(server)
        .get(`/api/messages/${chat.id}`)
        .set('Cookie', session);
      expect(status).toEqual(200);

      expect(body).toBeDefined();
      expect(body.length).toEqual(10);
      const message = body[0] as MessageResponse;
      validateResponse(message);
    });

    it('should successfully return a list of messages for the given chatId and cursor', async () => {
      const session = await login(server, current);
      const lastMessage = messages[4];

      const { body, status } = await request(server)
        .get(`/api/messages/${chat.id}`)
        .query({ cursor: lastMessage.sentAt })
        .set('Cookie', session);
      expect(status).toEqual(200);

      expect(body).toBeDefined();
      expect(body.length).toBeLessThanOrEqual(5);
      const message = body[0] as MessageResponse;
      validateResponse(message);

      expect(Date.parse(message.sentAt)).toBeLessThan(lastMessage.sentAt.getTime());
    });

    it('should throw an UnauthorizedException when no session is provided', async () => {
      const { status } = await request(server).get(`/api/messages/${chat.id}`);
      expect(status).toEqual(403);
    });

    it('should throw an BadRequestException when the cursor is not a valid date', async () => {
      const session = await login(server, current);

      const { body, status } = await request(server)
        .get(`/api/messages/${chat.id}`)
        .query({ cursor: 'cursor' })
        .set('Cookie', session);
      expect(status).toEqual(400);
      expect(body.message).toEqual('Not a valid cursor');
    });
  });

  describe('[CREATE_MESSAGE] - /api/messages/:chatId (POST)', () => {
    it('should successfully create the new message in the chat of the given chatId', async () => {
      const session = await login(server, current);
      const text = 'Hello World';

      const { body, status } = await request(server)
        .post(`/api/messages/${chat.id}`)
        .field('text', text)
        .set('Cookie', session);
      expect(status).toEqual(201);

      expect(body).toBeTruthy();

      // Confirm it got created
      const response = await request(server).get(`/api/messages/${chat.id}`).set('Cookie', session);
      expect(response.body.length).toEqual(1);
      const message = response.body[0] as MessageResponse;
      expect(message.text).toEqual(text);
    });

    it('should throw a BadRequestException if no file nor text is provided', async () => {
      const session = await login(server, current);

      const { body, status } = await request(server)
        .post(`/api/messages/${chat.id}`)
        .set('Cookie', session);
      expect(status).toEqual(400);

      expect(body.message).toEqual('Either a message or a file is required');
    });

    it('should throw a BadRequestException if the text is too long', async () => {
      const session = await login(server, current);
      let text = '';
      for (let i = 0; i < 2001; i++) {
        text += 'a';
      }

      const { body, status } = await request(server)
        .post(`/api/messages/${chat.id}`)
        .field('text', text)
        .set('Cookie', session);
      expect(status).toEqual(400);

      expect(body).toEqual({
        message: 'Input data validation failed',
        errors: [
          {
            field: 'text',
            message: 'Text must be at most 2000 characters',
          },
        ],
      });
    });

    it('should throw a BadRequestException if the text is empty', async () => {
      const session = await login(server, current);
      const text = '';

      const { body, status } = await request(server)
        .post(`/api/messages/${chat.id}`)
        .field('text', text)
        .set('Cookie', session);
      expect(status).toEqual(400);

      expect(body).toEqual({
        message: 'Input data validation failed',
        errors: [
          {
            field: 'text',
            message: 'Message must not be empty',
          },
        ],
      });
    });

    it('should throw an UnauthorizedException when no session is provided', async () => {
      const { status } = await request(server)
        .post(`/api/messages/${chat.id}`)
        .field('text', 'Hello');
      expect(status).toEqual(403);
    });
  });

  describe('[EDIT_MESSAGE] - /api/messages/:chatId (PUT)', function () {
    let message: Message;

    beforeEach(async () => {
      message = new Message(current);
      message.text = `Text Message`;
      message.chat = chat;
      await em.persistAndFlush(message);
    });

    it('should successfully update the new message for the given messageId', async () => {
      const session = await login(server, current);
      const text = 'Hello World';

      const { body, status } = await request(server)
        .put(`/api/messages/${message.id}`)
        .send({ text })
        .set('Cookie', session);
      expect(status).toEqual(200);

      expect(body).toBeTruthy();

      // Confirm it got updated
      const response = await request(server).get(`/api/messages/${chat.id}`).set('Cookie', session);
      expect(response.body.length).toEqual(1);
      const updatedMessage = response.body[0] as MessageResponse;
      expect(updatedMessage.id).toEqual(message.id);
      expect(updatedMessage.text).toEqual(text);
    });

    it('should throw a BadRequestException if the text is too long', async () => {
      const session = await login(server, current);
      let text = '';
      for (let i = 0; i < 2001; i++) {
        text += 'a';
      }

      const { body, status } = await request(server)
        .put(`/api/messages/${message.id}`)
        .send({ text })
        .set('Cookie', session);

      expect(status).toEqual(400);
      expect(body).toEqual({
        message: 'Input data validation failed',
        errors: [
          {
            field: 'text',
            message: 'Text must be at most 2000 characters',
          },
        ],
      });
    });

    it('should throw a BadRequestException if the text is empty', async () => {
      const session = await login(server, current);
      const text = '';

      const { body, status } = await request(server)
        .put(`/api/messages/${message.id}`)
        .send({ text })
        .set('Cookie', session);

      expect(status).toEqual(400);
      expect(body).toEqual({
        message: 'Input data validation failed',
        errors: [
          {
            field: 'text',
            message: 'Message must not be empty',
          },
        ],
      });
    });

    it('should throw an UnauthorizedException when no session is provided', async () => {
      const { status } = await request(server)
        .put(`/api/messages/${chat.id}`)
        .send({ text: 'Hello' });
      expect(status).toEqual(403);
    });
  });

  describe('[DELETE_MESSAGE] - /api/messages/:chatId (DELETE)', function () {
    let message: Message;

    beforeEach(async () => {
      message = new Message(current);
      message.text = `Text Message`;
      message.chat = chat;
      await em.persistAndFlush(message);
    });

    it('should successfully delete the new message for the given messageId', async () => {
      const session = await login(server, current);

      const { body, status } = await request(server)
        .delete(`/api/messages/${message.id}`)
        .set('Cookie', session);
      expect(status).toEqual(200);
      expect(body).toBeTruthy();

      // Confirm it got deleted
      const response = await request(server).get(`/api/messages/${chat.id}`).set('Cookie', session);
      expect(response.body.length).toEqual(0);
    });

    it('should throw an UnauthorizedException when no session is provided', async () => {
      const { status } = await request(server).delete(`/api/messages/${message.id}`);
      expect(status).toEqual(403);
    });
  });

  const validateResponse = (message: MessageResponse) => {
    expect(message.id).toBeDefined();
    expect(message.type).toEqual(MessageType.TEXT);
    expect(message.text).toBeDefined();
    expect(message.user).toBeDefined();
    expect(message.sentAt).toBeDefined();
  };

  afterEach(async () => {
    await service.clearDatabase();
    await app.close();
    server.close();
  });
});
