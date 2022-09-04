# Signal - Server

The server written using [TypeScript](https://www.typescriptlang.org/) and [NestJS](https://nestjs.com/)

# Stack

- [NestJS](https://nestjs.com/) for the REST server
- [MikroORM](https://mikro-orm.io/) as the database ORM
- PostgreSQL
- Sessions for authentication
- [ESLint](https://eslint.org/) for linting
- [Joi](https://joi.dev/) for validation
- [Sharp](https://sharp.pixelplumbing.com/) for image resizing
- [S3](https://aws.amazon.com/s3/) for storing the files

# Installation

1. Install Docker and get the PostgreSQL and Redis container
    ```bash
   $ docker run --name postgres -p 5432:5432 -e POSTGRES_USER=root -e POSTGRES_PASSWORD=password -d postgres:alpine
   $ docker run --name redis -d -p 6379:6379 redis:alpine redis-server --save 60 1
    ```
2. Start the Postgresql container and create a DB with the name `signal`
   ```bash
   $ docker exec -it postgres createdb --username=root --owner=root signal
   ```
3. Install the dependencies
    ```bash
   $ pnpm install
   ```
4. Rename `.env.example` to `.env` and fill in the values.
5. Run the server
   ```bash
   $ pnpm start:dev
   ```

# Testing
The server uses both unit tests and E2E tests.

### Unit Tests
1. Run the tests
   ```bash
   $ pnpm test
   ```
   
### E2E Tests
1. Create a test DB
   ```bash
    docker exec -it postgres createdb --username=root --owner=root signal_test
   ```
2. Have both the DB and Redis running
3. Run the tests
   ```bash
   $ pnpm test:e2e
   ```

## Reference Architecture

- https://www.karanpratapsingh.com/courses/system-design/whatsapp
