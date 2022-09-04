// noinspection TypeScriptValidateJSTypes

import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { ConfigModule } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { UsersModule } from '../src/users/users.module';
import { RegisterInput } from '../src/users/dto/register.input';
import { TestAppService } from './app.service';
import { Account } from '../src/users/dto/account.response';
import { validate } from 'uuid';
import { UpdateUserInput } from '../src/users/dto/update-user.dto';
import { setupApp } from '../src/app';
import { NestExpressApplication } from '@nestjs/platform-express';
import { configSchema } from '../src/common/schema/config.schema';

describe('UsersController (e2e)', () => {
  let app: NestExpressApplication;
  let service: TestAppService;
  let server: any;
  const usernameRegex = new RegExp('^.{3,32}#[0-9]{4}$');

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: '.env.test',
          validationSchema: configSchema,
        }),
        MikroOrmModule.forRoot(),
        UsersModule,
      ],
      controllers: [],
      providers: [TestAppService],
    }).compile();

    app = moduleFixture.createNestApplication<NestExpressApplication>();
    service = app.get<TestAppService>(TestAppService);

    await setupApp(app);

    await app.init();
    server = app.getHttpServer();
  });

  describe('[REGISTER] - /api/accounts/ (POST)', () => {
    const input: RegisterInput = {
      email: 'test@example.com',
      password: 'password',
      displayName: 'Test',
    };

    it('should successfully create and return the user on create', async () => {
      await createAccount(input);
    });

    it('should throw a BadRequestException if the email is already taken', async () => {
      await createAccount(input);

      // Same Request
      const { body, status, headers } = await request(server).post('/api/accounts').send(input);

      expect(status).toEqual(400);
      expect(body).toEqual({
        errors: [{ field: 'email', message: 'An account with that email already exists' }],
      });
      expect(headers['set-cookie']).toBeUndefined();
    });

    it('should throw a BadRequestException if the email is missing', async () => {
      const { body, status, headers } = await request(server).post('/api/accounts').send({
        displayName: 'Test',
        password: 'password',
      });

      expect(status).toEqual(400);
      expect(body).toEqual({
        message: 'Input data validation failed',
        errors: [{ field: 'email', message: 'Email is required' }],
      });
      expect(headers['set-cookie']).toBeUndefined();
    });

    it('should throw a BadRequestException if the email is not valid', async () => {
      const { body, status, headers } = await request(server).post('/api/accounts').send({
        displayName: 'Test',
        password: 'password',
        email: 'test',
      });

      expect(status).toEqual(400);
      expect(body).toEqual({
        message: 'Input data validation failed',
        errors: [{ field: 'email', message: 'Email must be a valid email' }],
      });
      expect(headers['set-cookie']).toBeUndefined();
    });

    it('should throw a BadRequestException if the displayName is missing', async () => {
      const { body, status, headers } = await request(server).post('/api/accounts').send({
        password: 'password',
        email: 'test@example.com',
      });

      expect(status).toEqual(400);
      expect(body).toEqual({
        message: 'Input data validation failed',
        errors: [{ field: 'displayName', message: 'DisplayName is required' }],
      });
      expect(headers['set-cookie']).toBeUndefined();
    });

    it('should throw a BadRequestException if the displayName is not valid', async () => {
      const { body, status, headers } = await request(server).post('/api/accounts').send({
        displayName: 'Te',
        password: 'password',
        email: 'test@example.com',
      });

      expect(status).toEqual(400);
      expect(body).toEqual({
        message: 'Input data validation failed',
        errors: [{ field: 'displayName', message: 'DisplayName length must be at least 3 characters long' }],
      });
      expect(headers['set-cookie']).toBeUndefined();
    });

    it('should throw a BadRequestException if the password is missing', async () => {
      const { body, status, headers } = await request(server).post('/api/accounts').send({
        displayName: 'Test',
        email: 'test@example.com',
      });

      expect(status).toEqual(400);
      expect(body).toEqual({
        message: 'Input data validation failed',
        errors: [{ field: 'password', message: 'Password is required' }],
      });
      expect(headers['set-cookie']).toBeUndefined();
    });

    it('should throw a BadRequestException if the password is not valid', async () => {
      const { body, status, headers } = await request(server).post('/api/accounts').send({
        displayName: 'Test',
        password: 'passw',
        email: 'test@example.com',
      });

      expect(status).toEqual(400);
      expect(body).toEqual({
        message: 'Input data validation failed',
        errors: [{ field: 'password', message: 'Password length must be at least 6 characters long' }],
      });
      expect(headers['set-cookie']).toBeUndefined();
    });
  });

  describe('[LOGIN] - /api/accounts/login (POST)', () => {
    const input: RegisterInput = {
      email: 'test@example.com',
      password: 'password',
      displayName: 'Test',
    };

    it('should successfully return the user when the credentials are valid', async () => {
      // Create Account
      await createAccount(input);

      // Confirm successful login
      const { body, status, headers } = await request(server).post('/api/accounts/login').send(input);

      expect(status).toEqual(200);
      validateUserResponse(body, input);
      expect(headers['set-cookie']).toBeDefined();
    });

    it('should throw an UnauthorizedException if the password is invalid', async () => {
      // Create Account
      await createAccount(input);

      // Confirm successful login
      const { body, status, headers } = await request(server).post('/api/accounts/login').send({
        email: input.email,
        password: 'wrong password',
      });

      expect(status).toEqual(401);
      expect(body).toEqual({
        errors: [{ field: 'email', message: 'Invalid Credentials' }],
      });
      expect(headers['set-cookie']).toBeUndefined();
    });

    it('should throw an UnauthorizedException if no user is found for the given email', async () => {
      const { body, status, headers } = await request(server).post('/api/accounts/login').send(input);
      expect(status).toEqual(401);
      expect(body).toEqual({
        errors: [{ field: 'email', message: 'Invalid Credentials' }],
      });
      expect(headers['set-cookie']).toBeUndefined();
    });
  });

  describe('[GETCURRENT] - /api/accounts (GET)', () => {
    const input: RegisterInput = {
      email: 'test@example.com',
      password: 'password',
      displayName: 'Test',
    };

    it('should successfully return the user for the given session', async () => {
      // Create Account
      const session = await createAccount(input);

      // Get the user for the given session
      const { status, body } = await request(server).get('/api/accounts').set('Cookie', session);

      expect(status).toEqual(200);
      validateUserResponse(body, input);
    });

    it('should throw an UnauthorizedException when no session is provided', async () => {
      // Create Account
      await createAccount(input);

      const { status } = await request(server).get('/api/accounts');

      expect(status).toEqual(403);
    });

    it('should throw an UnauthorizedException when the session is invalid', async () => {
      // Create Account
      await createAccount(input);

      // Get the user for the given session
      const { status } = await request(server).get('/api/accounts').set('Cookie', 'no real cookie');

      expect(status).toEqual(403);
    });
  });

  describe('[UPDATEACCOUNT] - /api/accounts (PUT)', () => {
    const input: RegisterInput = {
      email: 'test@example.com',
      password: 'password',
      displayName: 'Test',
    };

    const updateInput: UpdateUserInput = {
      email: 'test_updated@example.com',
      bio: 'The owner of this site',
      displayName: 'Test Updated',
    };

    it('should successfully update the user for the given session', async () => {
      // Create Account
      const session = await createAccount(input);

      // Get the user for the given session
      const { status, body } = await request(server)
        .put('/api/accounts')
        .set('Cookie', session)
        .field('email', updateInput.email)
        .field('displayName', updateInput.displayName)
        .field('bio', updateInput.bio);

      expect(status).toEqual(200);
      expect(body).toEqual<Account>({
        id: expect.any(String),
        displayName: updateInput.displayName,
        email: updateInput.email,
        username: expect.stringContaining(updateInput.displayName),
        image: expect.any(String),
        bio: updateInput.bio,
      });

      expect(validate(body.id)).toBeTruthy();
      expect(body.username).toMatch(usernameRegex);
    });

    it('should throw an UnauthorizedException when no session is provided', async () => {
      // Create Account
      await createAccount(input);

      // Get the user for the given session
      const { status } = await request(server)
        .put('/api/accounts')
        .field('email', updateInput.email)
        .field('displayName', updateInput.displayName)
        .field('bio', updateInput.bio);

      expect(status).toEqual(403);
    });

    it('should throw a BadRequestException if the email is already taken', async () => {
      const session = await createAccount(input);
      await createAccount({ ...input, email: updateInput.email });

      const { status, body } = await request(server)
        .put('/api/accounts')
        .set('Cookie', session)
        .field('email', updateInput.email)
        .field('displayName', updateInput.displayName)
        .field('bio', updateInput.bio);

      expect(status).toEqual(400);
      expect(body).toEqual({
        errors: [{ field: 'email', message: 'An account with that email already exists' }],
      });
    });

    it('should throw a BadRequestException if the email is missing', async () => {
      const session = await createAccount(input);

      const { status, body } = await request(server)
        .put('/api/accounts')
        .set('Cookie', session)
        .field('displayName', updateInput.displayName)
        .field('bio', updateInput.bio);

      expect(status).toEqual(400);
      expect(body).toEqual({
        message: 'Input data validation failed',
        errors: [{ field: 'email', message: 'Email is required' }],
      });
    });

    it('should throw a BadRequestException if the email is not valid', async () => {
      const session = await createAccount(input);

      const { status, body } = await request(server)
        .put('/api/accounts')
        .set('Cookie', session)
        .field('email', 'updated_email')
        .field('displayName', updateInput.displayName)
        .field('bio', updateInput.bio);

      expect(status).toEqual(400);
      expect(body).toEqual({
        message: 'Input data validation failed',
        errors: [{ field: 'email', message: 'Email must be a valid email' }],
      });
    });

    it('should throw a BadRequestException if the displayName is missing', async () => {
      const session = await createAccount(input);

      const { status, body } = await request(server)
        .put('/api/accounts')
        .set('Cookie', session)
        .field('email', updateInput.email)
        .field('bio', updateInput.bio);

      expect(status).toEqual(400);
      expect(body).toEqual({
        message: 'Input data validation failed',
        errors: [{ field: 'displayName', message: 'DisplayName is required' }],
      });
    });

    it('should throw a BadRequestException if the displayName is not valid', async () => {
      const session = await createAccount(input);

      const { status, body } = await request(server)
        .put('/api/accounts')
        .set('Cookie', session)
        .field('email', updateInput.email)
        .field('displayName', 'Up')
        .field('bio', updateInput.bio);

      expect(status).toEqual(400);
      expect(body).toEqual({
        message: 'Input data validation failed',
        errors: [{ field: 'displayName', message: 'DisplayName length must be at least 3 characters long' }],
      });
    });

    it('should throw a BadRequestException if the bio is not valid', async () => {
      const session = await createAccount(input);

      const { status, body } = await request(server)
        .put('/api/accounts')
        .set('Cookie', session)
        .field('email', updateInput.email)
        .field('displayName', updateInput.displayName)
        .field(
          'bio',
          // > 200 characters
          'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores e',
        );

      expect(status).toEqual(400);
      expect(body).toEqual({
        message: 'Input data validation failed',
        errors: [{ field: 'bio', message: 'Bio length must be less than or equal to 200 characters long' }],
      });
    });
  });

  const createAccount = async (input: RegisterInput): Promise<string> => {
    const { body, status, headers } = await request(server).post('/api/accounts').send(input);

    expect(status).toEqual(201);
    validateUserResponse(body, input);
    const session = headers['set-cookie'][0];
    expect(session).toBeDefined();

    return session;
  };

  const validateUserResponse = (result: Account, user: RegisterInput) => {
    expect(result).toEqual<Account>({
      id: expect.any(String),
      displayName: user.displayName,
      email: user.email,
      username: expect.stringContaining(user.displayName),
      image: expect.any(String),
      bio: '',
    });

    expect(validate(result.id)).toBeTruthy();
    expect(result.username).toMatch(usernameRegex);
  };

  afterEach(async () => {
    await service.clearDatabase();
    await app.close();
    server.close();
  });
});
