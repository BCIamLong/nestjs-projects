import * as pactum from 'pactum';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { loginDto, signupDto } from 'test/__mocks__';

// * USER => SIGNUP => LOGIN => SEE PROFILE => EDIT PROFILE => SEE BOOKMARKS => SEE SPECIFIC BOOKMARK => CREATE BOOKMARK => UPDATE USER'S BOOKMARK => DELETE USER'S BOOKMARK => LOGOUT

// * https://pactumjs.github.io/api/requests

describe('App (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    app = moduleFixture.createNestApplication();
    // * we don't want to write  .post('http://localhost:5000/auth/signup') in every test case right so let's set the base url and just write the path to the endpoint
    // *  .post('http://localhost:5000/auth/signup') => post('/auth/signup')
    pactum.request.setBaseUrl('http://localhost:5000');

    // ! Notice that we just create app from app module and everything outside the app module like in main.ts file we create app from app module and then setup something for it
    // * WE SHOULD INCLUDE ALL THESE SETUPS TO THIS APP TEST SO WE NEED TO MAKE IT AS REAL AS LIKE THE REAL APP OTHERWISE SOMETHING WILL NOT WORK

    // * like in this case we need use global pipes to validate the body if we don't setup it here then the pipes will not work and we maybe get some unexpected things or errors or bugs
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );

    await app.init(); // * we have event onModuleInit in PrismaService when app init the prisma will auto connect DB
    await app.listen(5000);

    await prisma.cleanDatabase();
  });

  afterAll(async () => {
    await app.close(); // * we have event onModuleDestroy in PrismaService when app close (destroy) the prisma will auto disconnect DB
  });

  it('/health-check (GET)', () => {
    return request(app.getHttpServer())
      .get('/health-check')
      .expect(200)
      .expect({ status: 'success', data: 'Ok' });
  });

  describe('Auth', () => {
    describe('Signup', () => {
      it('should throw an error if input fields are empty', async () => {
        await pactum.spec().post('/auth/signup').expectStatus(400);
        // .inspect(); //* use inspect to inspect the info of request (header and body of request, response...)
      });

      it('should throw an error if the required input fields are empty', async () => {
        await pactum
          .spec()
          .post('/auth/signup')
          .withBody({ ...signupDto, email: '' })
          .expectStatus(400);

        await pactum
          .spec()
          .post('/auth/signup')
          .withBody({ ...signupDto, password: '' })
          .expectStatus(400);
      });

      it('should throw an error if input fields are invalid (invalid email, password...)', async () => {
        await pactum
          .spec()
          .post('/auth/signup')
          .withBody({ ...signupDto, email: '123456' })
          .expectStatus(400);

        await pactum
          .spec()
          .post('/auth/signup')
          .withBody({ ...signupDto, password: '12345678' }) //* in this case password is combined by numbers and text so we just write numbers for fail signup for this test case right
          // * if we have like regex for password we can write some invalid values not match that regex
          .expectStatus(400);
      });

      it('should throw an error if confirm password is not match', async () => {
        await pactum
          .spec()
          .post('/auth/signup')
          .withBody({ ...signupDto, passwordConfirm: 'invalid_pwd123' })
          .expectStatus(400);
      });

      it('should signup', async () => {
        /* ---------------------------------
        let accessToken:string
        const { json: res } = await pactum
          .spec()
          .post('/auth/signup')
          .withBody(signupDto)
          .toss();
        //* toss() execute the test and return response
        //* https://pactumjs.github.io/api/requests/toss.html
        expect(res.status).toBe('success');
        expect(res.accessToken).toBeDefined();
        accessToken = res.accessToken
      
        //* so we might do something like above to get access token and continue for test for the endpoint need to check authentication so need to login or signup to use

        //* but with pactum it's quite easy to do it so pactum can save the data back from response or request
        //* in this case the response return will have access token and we will use pactum to store this value to this context object and then reuse it
        //* so we don't need to do something like above so create accessToken variable at the top level code and reuse it right so it's quite easy if we use pactum

        ------------------------------------*/
        await pactum
          .spec()
          .post('/auth/signup')
          .withBody(signupDto)
          .expectStatus(201)
          .stores('accessToken', 'token');
        //* so we can store the token from the response body we get to the accessToken in the context object so like store to the accessToken variable
        //* so like this and we can reuse it in everywhere with pactum
      });
    });

    describe('Login', () => {
      it('should throw an error if input fields are empty', async () => {
        await pactum.spec().post('/auth/local/login1').expectStatus(400);
      });
      it('should throw an error if the required input fields are empty', async () => {
        await pactum
          .spec()
          .post('/auth/local/login1')
          .withBody({
            email: loginDto.email,
          })
          .expectStatus(400);

        await pactum
          .spec()
          .post('/auth/local/login1')
          .withBody({
            password: loginDto.password,
          })
          .expectStatus(400);
      });

      it('should throw an error if input fields are invalid (invalid email, password...)', async () => {
        await pactum
          .spec()
          .post('/auth/local/login1')
          .withBody({
            ...loginDto,
            email: 'invalid_email',
          })
          .expectStatus(400);

        await pactum
          .spec()
          .post('/auth/local/login1')
          .withBody({
            ...loginDto,
            password: 'invalid_password',
          })
          .expectStatus(400);
      });

      it('should login', async () => {
        await pactum
          .spec()
          .post('/auth/local/login1')
          .withBody(loginDto)
          .expectStatus(200)
          // * we can use this to check the response object as bellow
          .expectBodyContains('status')
          .expectBodyContains('token');
      });
    });
  });

  describe('User', () => {
    describe('Get me', () => {
      it("should throw an error if the user doesn't login", async () => {
        await pactum
          .spec()
          .get('/users/me')
          .expectStatus(401)
          .expectBodyContains('message');
      });

      it('should get the current user data', async () => {
        await pactum
          .spec()
          .get('/users/me')
          // * in pactum to use the variable in its context object we can use '$S{key}' so like literal template right but it doesn't need `` we can use '' "" as normal as well
          // * https://pactumjs.github.io/api/requests/stores.html
          // * in this case we stored the accessToken data then we can get this with pactum and reuse everywhere with pactum right
          // .withHeaders('Authorization', 'Bearer $S{accessToken}')
          .withBearerToken('$S{accessToken}')
          // .withHeaders({
          //   Authorization: 'Bearer $S{accessToken}',
          // })
          .expectStatus(200)
          .expectBodyContains('data')
          .expectBodyContains('status');
      });
    });

    describe('Update me', () => {
      it("should throw an error if the user doesn't login", async () => {
        await pactum
          .spec()
          .patch('/users/me')
          .expectStatus(401)
          .expectBodyContains('message');
      });

      it('should throw an error if the input fields are invalid', async () => {
        await pactum
          .spec()
          .patch('/users/me')
          .withBearerToken('$S{accessToken}')
          .withBody({
            email: 'invalid_update_email',
          })
          .expectStatus(400)
          .expectBodyContains('message');

        await pactum
          .spec()
          .patch('/users/me')
          .withBody({
            // name: undefined, //* in this case name field in schema is can be null therefore undefined will be null which is valid
            name: 1234, //* we can check the invalid value with number because name is string right
          })
          .withBearerToken('$S{accessToken}')
          .expectStatus(400)
          .expectBodyContains('message');
      });

      it('should update the current user', async () => {
        await pactum
          .spec()
          .patch('/users/me')
          .withBearerToken('$S{accessToken}')
          .withBody({
            email: 'newtest@gmail.com',
            name: 'New Name',
          })
          .expectStatus(200)
          .expectBodyContains('data');
      });
    });
  });

  describe('Bookmark', () => {});
});
