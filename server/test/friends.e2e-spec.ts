// noinspection TypeScriptValidateJSTypes

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { UsersModule } from '../src/users/users.module';
import { TestAppService } from './app.service';
import { setupApp } from '../src/app';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigSchema } from '../src/common/schema/config.schema';
import { FriendsModule } from '../src/friends/friends.module';
import { EntityManager } from '@mikro-orm/core';
import { User } from '../src/users/entities/user.entity';
import * as request from 'supertest';
import { RequestResponse } from '../src/friends/dto/request.response';
import { RequestType } from '../src/friends/entities/request.enum';
import { v4 } from 'uuid';
import { UserResponse } from '../src/friends/dto/user.response';
import { login } from './helpers';

describe('FriendsController (e2e)', () => {
  let app: NestExpressApplication;
  let service: TestAppService;
  let server: any;
  let em: EntityManager;
  let current: User;
  let receiver: User;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: '.env.test',
          validationSchema: ConfigSchema,
        }),
        MikroOrmModule.forRoot(),
        UsersModule,
        FriendsModule,
      ],
      controllers: [],
      providers: [TestAppService],
    }).compile();

    app = moduleFixture.createNestApplication<NestExpressApplication>();
    service = app.get<TestAppService>(TestAppService);
    em = service.getEntityManager().fork();

    await setupApp(app);

    current = new User('test@example.com', 'Test', 'password');
    receiver = new User('receiver@example.com', 'Receiver', 'password');
    await em.persistAndFlush([current, receiver]);

    await app.init();
    server = app.getHttpServer();
  });

  describe('[REQUESTS] - /api/requests/ (GET)', () => {
    // Seed DB with requests
    beforeEach(async () => {
      const users: User[] = [];
      for (let i = 0; i < 10; i++) {
        const u = new User(`$user-${i}@example.com`, `User #${i}`, 'password');
        if (i % 3 === 0) current.incomingRequests.add(u);
        else if (i % 2 === 0) current.outgoingRequests.add(u);
        users.push(u);
      }

      await em.persistAndFlush([...users, current]);
    });

    it('should successfully return a list of requests for the current user', async () => {
      const session = await login(server, current);

      const { body, status } = await request(server).get('/api/requests').set('Cookie', session);
      expect(status).toEqual(200);
      expect(body.length).toEqual(7);

      const result = body as RequestResponse[];
      const user = result.at(0)?.user;
      expect(user).toBeDefined();
      expect(user?.id).toBeDefined();
      expect(user?.username).toBeDefined();
      expect(user?.displayName).toBeDefined();
      expect(user?.image).toBeDefined();
      expect(user?.bio).toBeDefined();
      expect(user?.lastOnline).toBeDefined();

      expect(result.filter((e) => e.type === RequestType.INCOMING).length).toEqual(4);
      expect(result.filter((e) => e.type === RequestType.OUTGOING).length).toEqual(3);
    });

    it('should throw an UnauthorizedException when no session is provided', async () => {
      const { status } = await request(server).get('/api/requests');
      expect(status).toEqual(403);
    });
  });

  describe('[ADD_REQUEST] - /api/requests/ (POST)', () => {
    it('should successfully send a friends request to the other user', async () => {
      const session = await login(server, current);

      const { body, status } = await request(server)
        .post('/api/requests')
        .set('Cookie', session)
        .send({ username: receiver.username });

      expect(status).toEqual(201);
      expect(body).toBeTruthy();

      // Confirm the request exists
      const response = await request(server).get('/api/requests').set('Cookie', session);
      expect(response.status).toEqual(200);
      expect(response.body[0].user.id).toEqual(receiver.id);
      expect(response.body[0].type).toEqual(RequestType.OUTGOING);
    });

    it('should throw a BadRequestException if the users are already friends', async () => {
      current.friends.add(receiver);
      await em.flush();

      const session = await login(server, current);

      const { body, status } = await request(server)
        .post('/api/requests')
        .set('Cookie', session)
        .send({ username: receiver.username });

      expect(status).toEqual(400);
      expect(body).toEqual({
        message: 'You are already friends with that person',
      });
    });

    it('should automatically add the other user if they already sent a friends request to the current user', async () => {
      // Add the current user to the receivers friend requests
      receiver.outgoingRequests.add(current);
      await em.flush();

      const session = await login(server, current);

      const { body, status } = await request(server)
        .post('/api/requests')
        .set('Cookie', session)
        .send({ username: receiver.username });

      expect(status).toEqual(201);
      expect(body).toBeTruthy();

      // Confirm they are friends
      const response = await request(server).get('/api/friends').set('Cookie', session);
      expect(response.status).toEqual(200);
      expect(response.body[0].id).toEqual(receiver.id);

      // Confirm the request is gone
      const response2 = await request(server).get('/api/requests').set('Cookie', session);
      expect(response2.status).toEqual(200);
      expect(response2.body.length).toEqual(0);
    });

    it('should throw a BadRequestException if no valid username is provided', async () => {
      const session = await login(server, current);

      const { body, status } = await request(server)
        .post('/api/requests')
        .set('Cookie', session)
        .send({ username: receiver.id });

      expect(status).toEqual(400);
      expect(body).toEqual({
        message: 'Input data validation failed',
        errors: [{ field: 'username', message: 'Must be a valid username' }],
      });
    });

    it('should throw an UnauthorizedException when no session is provided', async () => {
      const { status } = await request(server).post('/api/requests').send({ username: v4() });
      expect(status).toEqual(403);
    });
  });

  describe('[ACCEPT_REQUEST] - /api/requests/:id/accept (POST)', () => {
    it('should successfully add the other user as a friend', async () => {
      // Add the current user to the receivers friend requests
      current.incomingRequests.add(receiver);
      await em.flush();

      const session = await login(server, current);

      const { body, status } = await request(server)
        .post(`/api/requests/${receiver.id}/accept`)
        .set('Cookie', session);

      expect(status).toEqual(200);
      expect(body).toBeTruthy();

      // Confirm they are friends
      const response = await request(server).get('/api/friends').set('Cookie', session);
      expect(response.status).toEqual(200);
      expect(response.body[0].id).toEqual(receiver.id);
    });

    it('should not allow the request sender to accept the request', async () => {
      receiver.incomingRequests.add(current);
      await em.flush();

      const session = await login(server, current);

      const { body, status } = await request(server)
        .post(`/api/requests/${receiver.id}/accept`)
        .set('Cookie', session);

      expect(status).toEqual(200);
      expect(body).toBeTruthy();

      // Confirm they are not friends
      const response = await request(server).get('/api/friends').set('Cookie', session);
      expect(response.status).toEqual(200);
      expect(response.body.length).toEqual(0);
    });

    it('should throw an UnauthorizedException when no session is provided', async () => {
      const id = v4();
      const { status } = await request(server).post(`/api/requests/${id}/accept`);
      expect(status).toEqual(403);
    });
  });

  describe('[REMOVE_REQUEST] - /api/requests/:id/remove (POST)', () => {
    it('should successfully remove the incoming request', async () => {
      current.incomingRequests.add(receiver);
      await em.flush();

      const session = await login(server, current);

      const { body, status } = await request(server)
        .post(`/api/requests/${receiver.id}/remove`)
        .set('Cookie', session);

      expect(status).toEqual(200);
      expect(body).toBeTruthy();

      // Confirm there are no requests
      const response = await request(server).get('/api/requests').set('Cookie', session);
      expect(response.status).toEqual(200);
      expect(response.body.length).toEqual(0);
    });

    it('should successfully remove the outgoing request', async () => {
      current.outgoingRequests.add(receiver);
      await em.flush();

      const session = await login(server, current);

      const { body, status } = await request(server)
        .post(`/api/requests/${receiver.id}/remove`)
        .set('Cookie', session);

      expect(status).toEqual(200);
      expect(body).toBeTruthy();

      // Confirm there are no requests
      const response = await request(server).get('/api/requests').set('Cookie', session);
      expect(response.status).toEqual(200);
      expect(response.body.length).toEqual(0);
    });

    it('should return true even if no request exists', async () => {
      const session = await login(server, current);

      const { body, status } = await request(server)
        .post(`/api/requests/${receiver.id}/remove`)
        .set('Cookie', session);

      expect(status).toEqual(200);
      expect(body).toBeTruthy();
    });

    it('should throw an UnauthorizedException when no session is provided', async () => {
      const id = v4();
      const { status } = await request(server).post(`/api/requests/${id}/remove`);
      expect(status).toEqual(403);
    });
  });

  describe('[FRIENDS] - /api/friends/ (GET)', () => {
    // Seed DB with requests
    beforeEach(async () => {
      const users: User[] = [];
      for (let i = 0; i < 10; i++) {
        const u = new User(`$user-${i}@example.com`, `User #${i}`, 'password');
        if (i % 2 === 0) current.friends.add(u);
        users.push(u);
      }

      await em.persistAndFlush([...users, current]);
    });

    it('should successfully return a list of friends for the current user', async () => {
      const session = await login(server, current);

      const { body, status } = await request(server).get('/api/friends').set('Cookie', session);
      expect(status).toEqual(200);
      expect(body.length).toEqual(5);

      const result = body as UserResponse[];
      const user = result.at(0);
      expect(user).toBeDefined();
      expect(user?.id).toBeDefined();
      expect(user?.username).toBeDefined();
      expect(user?.displayName).toBeDefined();
      expect(user?.image).toBeDefined();
      expect(user?.bio).toBeDefined();
    });

    it('should throw an UnauthorizedException when no session is provided', async () => {
      const { status } = await request(server).get('/api/friends');
      expect(status).toEqual(403);
    });
  });

  describe('[REMOVE_FRIEND] - /api/friends/:id/ (DELETE)', () => {
    it('should successfully remove the friend', async () => {
      // Add the receiver as a friend
      current.friends.add(receiver);
      await em.flush();

      const session = await login(server, current);

      const { body, status } = await request(server)
        .delete(`/api/friends/${receiver.id}`)
        .set('Cookie', session);

      expect(status).toEqual(200);
      expect(body).toBeTruthy();

      // Confirm they aren't friends anymore
      const response = await request(server).get('/api/friends').set('Cookie', session);
      expect(response.status).toEqual(200);
      expect(response.body.length).toEqual(0);
    });

    it('should return true even when they were not friends', async () => {
      const session = await login(server, current);

      const { status } = await request(server)
        .delete(`/api/friends/${receiver.id}`)
        .set('Cookie', session);
      expect(status).toBeTruthy();
    });

    it('should throw an UnauthorizedException when no session is provided', async () => {
      const id = v4();
      const { status } = await request(server).delete(`/api/friends/${id}`);
      expect(status).toEqual(403);
    });
  });

  afterEach(async () => {
    await service.clearDatabase();
    await app.close();
    server.close();
  });
});
