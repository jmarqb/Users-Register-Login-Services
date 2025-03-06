import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { UsersModule } from '../src/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../src/users/entities/user.entity';

import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { Client } from 'pg';


let testUserId: string;
let container: StartedPostgreSqlContainer;
let client: Client;
let app: INestApplication;
let testUserRepository;

describe('AppController (e2e)', () => {

  beforeAll(async () => {
    jest.setTimeout(60000);

    console.log('Starting PostgreSQL container...');
    container = await new PostgreSqlContainer().withDatabase(`${process.env.DATABASE_NAME_TEST_E2E}`)
      .withExposedPorts({ container: 5432, host: Number(`${process.env.DATABASE_PORT_TEST_E2E}`) })
      .withUsername(`${process.env.DATABASE_USERNAME_TEST_E2E}`)
      .withPassword(`${process.env.DATABASE_PASSWORD_TEST_E2E}`)
      .start();
    console.log('Container started.');

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, UsersModule, TypeOrmModule.forFeature([User]), TypeOrmModule],
    })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    testUserRepository = moduleFixture.get('UserRepository');
    await app.init();
  }, 60000);

    let adminToken: string;
    let adminID: string;
    let userIdToUpdate: string;
    let userIdToDelete: string;
    let tokenUser: string;
    let userAdmin;
    const updateData = {
      name: 'UpdatedName',
    };

  async function createFakeUserAndGetToken() {
    const newuser = await request(app.getHttpServer())
      .post('/users')
      .send({
        'name': 'newUser',
        'email': 'newUser@google.com',
        'password': 'Abc123'
      });

    const user_tst = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'newUser@google.com',
        password: 'Abc123'
      });

    tokenUser = user_tst.body.token;
    return tokenUser;
  }

  async function createFakeAdminUserAndGetToken() {
    //create a fakeAdmin in database
    await request(app.getHttpServer())
      .post('/users')
      .send({
        'name': `testAdmin`,
        'email': `testAdmin@admin.com`,
        'password': 'AdminPassword123'
      }).expect(201)
      .expect((res) => {
        adminID = res.body.id;
      });
    //find user admin and establish roles 'admin'
    userAdmin = await testUserRepository.findOne({ where: { id: adminID } });
    userAdmin.roles[0] = 'admin';
    testUserRepository.save(userAdmin);

    //login admin and get token
    const adminUser = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'testAdmin@admin.com',
        password: 'AdminPassword123'
      });

    adminToken = adminUser.body.token;
    return adminToken;
  }

  async function getUserIdToUpdate() {
    // Create a user for updated
    const user = await request(app.getHttpServer())
      .post('/users')
      .send({
        'name': 'testUserForUpdate',
        'email': 'testUserForUpdate@google.com',
        'password': 'Abc123'
      });

    userIdToUpdate = user.body.id;
    return userIdToUpdate;
  }

  async function getUserIdToDelete() {
    // Create a user for updated
    const user = await request(app.getHttpServer())
      .post('/users')
      .send({
        'name': 'testUserForUpdate',
        'email': 'testUserForUpdate@google.com',
        'password': 'Abc123'
      });

    userIdToDelete = user.body.id;
    return userIdToDelete;
  }

  describe('/auth/login (POST)', () => {

    it('should login with valid credentials', async () => {
      //create a fakeuser in database
      const fakeUser = await request(app.getHttpServer())
        .post('/users')
        .send({
          'name': 'testUsere2e',
          'email': 'testUsere2e@google.com',
          'password': 'Abc123'
        }).expect((res) => {
          testUserId = res.body.id;
        });
      return await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'testUsere2e@google.com',
          password: 'Abc123',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.token).toBeDefined();
        });
    });
  });

  describe('/users (POST)', () => {

    it('should register new user succesfully', async () => {
      //create a fakeuser in database
      await request(app.getHttpServer())
        .post('/users')
        .send({
          'name': `testUser${new Date().getTime()}`,
          'email': `testUser${new Date().getTime()}e2e@google.com`,
          'password': 'Abc123'
        }).expect(201)
        .expect((res) => {
          testUserId = res.body.id;
          expect(res.body).toHaveProperty('email')
          expect(res.body).toHaveProperty('name')
          expect(res.body).toHaveProperty('id')
          expect(res.body).toHaveProperty('roles')
          expect(res.body.password).toBeUndefined()
        });
    });

    it('should not allow duplicate emails', async () => {
      const userData = {
        'name': 'testUser',
        'email': 'duplicateTestUser@google.com',
        'password': 'Abc123'
      };

      // First Register
      await request(app.getHttpServer())
        .post('/users')
        .send(userData)
        .expect(201)
        .expect((res) => {
          testUserId = res.body.id;
        });

      // Second register with the same data
      await request(app.getHttpServer())
        .post('/users')
        .send(userData)
        .expect(400);  // Expecting error 400 (Bad Request) - Duplicate Key
    });

    it('should require a valid email', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send({
          'name': 'testUser',
          'email': 'invalidEmail',
          'password': 'Abc123'
        })
        .expect(400);
    });

    it('should require a password', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send({
          'name': 'testUser',
          'email': 'testUser@google.com',
        })
        .expect(400);
    });

    it('should return user object without password on success', async () => {
      const response = await request(app.getHttpServer())
        .post('/users')
        .send({
          'name': 'testUser2',
          'email': 'testUser2@google.com',
          'password': 'Abc123'
        })
        .expect(201);

      expect(response.body.password).toBeUndefined();
    });
  });

  describe('/users (GET)', () => {

    it('should respond with paginated users', async () => {
      await request(app.getHttpServer())
        .get('/users')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('items');
          expect(res.body.items).toBeInstanceOf(Array);
          expect(res.body).toHaveProperty('total');
          expect(res.body).toHaveProperty('currentPage');
          expect(res.body).toHaveProperty('totalPages');
        });
    });

    it('should respond with an array of users', async () => {
      await request(app.getHttpServer())
        .get('/users')
        .expect(200)
        .expect((res) => {
          expect(res.body.items).toBeInstanceOf(Array);
        });
    });

    it('should respect the limit and offset parameters', async () => {

      for (let i = 0; i <= 11; i++) {
        //create a fakeusers in database
        await request(app.getHttpServer())
          .post('/users')
          .send({
            'name': `testUser${new Date().getTime()}`,
            'email': `testUser${new Date().getTime()}e2e@google.com`,
            'password': 'Abc123'
          })
      }

      await request(app.getHttpServer())
        .get('/users?limit=5&offset=5')
        .expect(200)
        .expect((res) => {
          expect(res.body.items.length).toBe(5);
        });
    });

    it('should respond with an array of active users', async () => {
      const response = await request(app.getHttpServer())
        .get('/users')
        .expect(200);

      expect(response.body.items).toBeInstanceOf(Array);
      response.body.items.forEach(user => {
        expect(user.isActive).toBe(true); 
      });
    });

    it('should respect the provided limit', async () => {
      const limit = 5;
      const response = await request(app.getHttpServer())
        .get(`/users?limit=${limit}`)
        .expect(200);

      expect(response.body.items.length).toBeLessThanOrEqual(limit);
    });

    it('should respect the provided offset', async () => {
      for (let i = 0; i <= 11; i++) {
        //create a fakeusers in database
        await request(app.getHttpServer())
          .post('/users')
          .send({
            'name': `testUser${new Date().getTime()}`,
            'email': `testUser${new Date().getTime()}e2e@google.com`,
            'password': 'Abc123'
          })
      }

      const limit = 5;
      const offset = 5;

      const firstResponse = await request(app.getHttpServer())
        .get(`/users?limit=${limit}&offset=${offset}`)
        .expect(200);

      const secondResponse = await request(app.getHttpServer())
        .get(`/users?limit=${limit}&offset=${offset + limit}`)
        .expect(200);

      expect(firstResponse.body.items[0].id).not.toBe(secondResponse.body.items[0].id);
    });

    it('should return the correct total count and pages', async () => {
      const limit = 5;
      const response = await request(app.getHttpServer())
        .get(`/users?limit=${limit}`)
        .expect(200);

      expect(response.body.total).toBeDefined();
      expect(response.body.totalPages).toBeDefined();
      expect(response.body.totalPages).toBe(Math.ceil(response.body.total / limit));
    });

    it('should use default values if limit and offset are not provided', async () => {
      const response = await request(app.getHttpServer())
        .get('/users')
        .expect(200);

      expect(response.body.items.length).toBeLessThanOrEqual(10); // default limit
      expect(response.body.currentPage).toBe(1); // default page
    });
  });

  describe('/users/:id (GET)', () => {

    let activeUserId;
    let UserAdminId;
    let UserFake;
    let activeUserID;
    let inactiveUser;

    it('should retrieve a user by its id', async () => {

      //create a fakeuser in database
      const fakeUser = await request(app.getHttpServer())
        .post('/users')
        .send({
          'name': 'testUsere2e',
          'email': 'testUsere2e@google.com',
          'password': 'Abc123'
        }).expect((res) => {
          activeUserId = res.body.id;
        });

      await request(app.getHttpServer())
        .get(`/users/${activeUserId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(activeUserId);
          expect(res.body.isActive).toBe(true);
        });
    });

    it('should return bad request if id is not a valid UUID', async () => {
      const invalidId = '1234';
      await request(app.getHttpServer())
        .get(`/users/${invalidId}`)
        .expect(400);
    });

    it('should return not found if user does not exist', async () => {
      const nonExistingUserId = '8a70c8ed-448c-4c82-8b3f-4481880d8a91'; //This UUID not EXists
      await request(app.getHttpServer())
        .get(`/users/${nonExistingUserId}`)
        .expect(404);
    });

    it('should return an error if user is inactive', async () => {

      // Create a test user.
      const fakeUser = await request(app.getHttpServer())
        .post('/users')
        .send({
          'name': 'testUsere2e',
          'email': 'testUsere2e@google.com',
          'password': 'Abc123'
        }).expect((res) => {
          activeUserID = res.body.id;
        });

      UserFake = await testUserRepository.findOne({ where: { id: activeUserID } });
      UserFake.isActive = false;
      await testUserRepository.save(UserFake);

      // Try to get the inactive user.
      await request(app.getHttpServer())
        .get(`/users/${UserFake.id}`)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toBe(`The user is inactive in database.`)
            ;
        });
    });

  });

  describe('/users/:id (PATCH)', () => {

    it('should update a user with admin role', async () => {

      await createFakeAdminUserAndGetToken();

      await getUserIdToUpdate();

      await request(app.getHttpServer())
        .patch(`/users/${userIdToUpdate}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe(updateData.name);
        });
    });

    it('should unauthorized if a user with invalid token', async () => {

      await getUserIdToUpdate();

      await request(app.getHttpServer())
        .patch(`/users/${userIdToUpdate}`)
        .set('Authorization', `Bearer ${'invalidToken'}`)
        .send(updateData)
        .expect(401)
    });

    it('should not update a user with a non-admin role', async () => {

      await createFakeUserAndGetToken();

      await request(app.getHttpServer())
        .patch(`/users/${adminID}`)
        .set('Authorization', `Bearer ${tokenUser}`)
        .send(updateData)
        .expect(403);
    });

    it('should return bad request if id is not a valid UUID', async () => {

      await createFakeAdminUserAndGetToken();

      await request(app.getHttpServer())
        .patch('/users/invalidUUID')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(400);
    });

    it('should return not found if user does not exist', async () => {

      await createFakeAdminUserAndGetToken();

      const nonExistingUserId = '8a70c8ed-448c-4c82-8b3f-4481880d8a91';
      await request(app.getHttpServer())
        .patch(`/users/${nonExistingUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(404);
    });

  });

  describe('/users/:id (DELETE)', () => {

    it('should delete a user with admin role', async () => {

      await createFakeAdminUserAndGetToken();

      await getUserIdToDelete();

      await request(app.getHttpServer())
        .delete(`/users/${userIdToDelete}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.isActive).toBe(false);
        });
    });

    it('should not delete a user with a non-admin role', async () => {

      await createFakeUserAndGetToken();

      await request(app.getHttpServer())
        .delete(`/users/${adminID}`)
        .set('Authorization', `Bearer ${tokenUser}`)
        .expect(403);
    });

    it('should throw unauthorized if a user with invalid token', async () => {

      await getUserIdToDelete();

      await request(app.getHttpServer())
        .delete(`/users/${userIdToDelete}`)
        .set('Authorization', `Bearer ${'invalidToken'}`)
        .expect(401)
    });

    it('should return bad request if id is not a valid UUID', async () => {

      await createFakeAdminUserAndGetToken();

      await request(app.getHttpServer())
        .delete('/users/invalidUUID')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);
    });

    it('should return not found if user does not exist', async () => {

      await createFakeAdminUserAndGetToken();

      const nonExistingUserId = '8a70c8ed-448c-4c82-8b3f-4481880d8a91';
      await request(app.getHttpServer())
        .delete(`/users/${nonExistingUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should return bad request if user to want delete is inactive in database', async () => {
      await createFakeAdminUserAndGetToken();

      await getUserIdToDelete();

      const user = await testUserRepository.findOne({where:{id:userIdToDelete}});
      user.isActive = false;
      await testUserRepository.save(user);

      await request(app.getHttpServer())
        .delete(`/users/${userIdToDelete}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400)
        .expect((res)=>{
          expect(res.body.message).toBe(`The user is inactive in database.`);
        });

    });
  });

  afterEach(async () => {
    await testUserRepository.clear();
  });

  afterAll(async () => {
    if (client) await client.end();
    if (container) await container.stop();
    await app.close();
  });

});




