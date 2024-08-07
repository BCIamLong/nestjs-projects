import * as pactum from 'pactum';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { bookmarkInput, loginDto, signupDto } from 'test/__mocks__';

// * USER => SIGNUP => LOGIN => GET PROFILE => EDIT PROFILE => GO TO DASHBOARD OR SOMETHING => SEE EMPTY LIST OF BOOKMARKS =>  CREATE BOOKMARK => GET BOOKMARKS =>  GET SPECIFIC BOOKMARK => UPDATE USER'S BOOKMARK => DELETE USER'S BOOKMARK => ACCESS TOKEN EXPIRES => GET REFRESH UPDATE ACCESS TOKEN => CONTINUE USE APP => LOGOUT

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
    // * we don't want to write  .post('http://localhost:5000/auth/signup1') in every test case right so let's set the base url and just write the path to the endpoint
    // *  .post('http://localhost:5000/auth/signup1') => post('/auth/signup1')
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
        await pactum.spec().post('/auth/signup1').expectStatus(400);
        // .inspect(); //* use inspect to inspect the info of request (header and body of request, response...)
      });

      it('should throw an error if the required input fields are empty', async () => {
        await pactum
          .spec()
          .post('/auth/signup1')
          .withBody({ ...signupDto, email: '' })
          .expectStatus(400);

        await pactum
          .spec()
          .post('/auth/signup1')
          .withBody({ ...signupDto, password: '' })
          .expectStatus(400);
      });

      it('should throw an error if input fields are invalid (invalid email, password...)', async () => {
        await pactum
          .spec()
          .post('/auth/signup1')
          .withBody({ ...signupDto, email: '123456' })
          .expectStatus(400);

        await pactum
          .spec()
          .post('/auth/signup1')
          .withBody({ ...signupDto, password: '12345678' }) //* in this case password is combined by numbers and text so we just write numbers for fail signup for this test case right
          // * if we have like regex for password we can write some invalid values not match that regex
          .expectStatus(400);
      });

      it('should throw an error if confirm password is not match', async () => {
        await pactum
          .spec()
          .post('/auth/signup1')
          .withBody({ ...signupDto, passwordConfirm: 'invalid_pwd123' })
          .expectStatus(400);
      });

      it('should signup', async () => {
        /* ---------------------------------
        let accessToken:string
        const { json: res } = await pactum
          .spec()
          .post('/auth/signup1')
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
          .post('/auth/signup1')
          .withBody(signupDto)
          .expectStatus(201)
          .stores('accessToken', 'token')
          // .stores('refreshToken', '[set-cookie][1]')
          .stores((req, res) => {
            // console.log(res);
            // console.log(res.headers['set-cookie'][1].split('=')[1]);
            return {
              // ! if we need to do some manipulate like in this case we want to split string or something like that we should use the stores with callback way because we can use JS like functions, utils... to calculate, manipulate... to get the data we want
              // ! .stores('accessToken', 'token') the normal way so key -> path,value is just access to the value and assign to the key right but we have no way to manipulate and edit that value right
              refreshToken: res.headers['set-cookie'][1]
                .split(';')[0]
                .split('=')[1],
              // * because the value we get in headers is not format so i need to do this like above to get the refresh token value
            };
          });
        // .inspect(); //! if we use inspect that mean we end the process of the object chaining so that mean something we chain after will not execute therefore when we use inspect it should always at the end of the object chaining
        // ! .inspect().stores() => FALSE
        // ! .stores().inspect() => TRUE
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
      // it("should throw an error if the user doesn't login", async () => {
      // ! because we follow the flow of the user use our app process right, we don't test it like separate like unit test
      // * it should go as the flow now the user already login we don't do something like this like in unit test right we now do the e2e testing so it's different
      //   await pactum
      //     .spec()
      //     .get('/users/me')
      //     .expectStatus(401)
      //     .expectBodyContains('message');
      // });

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
      // it("should throw an error if the user doesn't login", async () => {
      // ! because we follow the flow of the user use our app process right, we don't test it like separate like unit test
      // * it should go as the flow now the user already login we don't do something like this like in unit test right we now do the e2e testing so it's different
      //   await pactum
      //     .spec()
      //     .patch('/users/me')
      //     .expectStatus(401)
      //     .expectBodyContains('message');
      // });

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

  describe('Bookmark', () => {
    describe('Get bookmarks', () => {
      it('should get an empty list of bookmarks', async () => {
        await pactum
          .spec()
          .get('/bookmarks')
          .withBearerToken('$S{accessToken}')
          .expectStatus(200)
          .expectBodyContains('data')
          .expectBodyContains([]); //* we even check the value contains in the body not only the key like above
      });
    });

    describe('Create bookmark', () => {
      it('should throw an error if the input fields are empty', async () => {
        await pactum
          .spec()
          .post('/bookmarks')
          .withBearerToken('$S{accessToken}')
          .expectStatus(400)
          .expectBodyContains('message');
      });

      it('should throw an error if the required input fields are empty', async () => {
        await pactum
          .spec()
          .post('/bookmarks')
          .withBearerToken('$S{accessToken}')
          .withBody({ ...bookmarkInput, title: '', link: '' })
          .expectStatus(400)
          .expectBodyContains('message');
      });

      it('should throw an error if the input fields are invalid', async () => {
        await pactum
          .spec()
          .post('/bookmarks')
          .withBearerToken('$S{accessToken}')
          .withBody({ ...bookmarkInput, title: 1234, link: 1234 })
          .expectStatus(400)
          .expectBodyContains('message');
      });

      it('should create a bookmark', async () => {
        await pactum
          .spec()
          .post('/bookmarks')
          .withBearerToken('$S{accessToken}')
          // * the access token strategy will check the token and assign the user payload to the req.user
          // * then we get the userId from there so we don't need to pass userId to the bookmark input
          // * like {...bookmarkInput, userId} so we don't need to do that right
          .withBody(bookmarkInput)
          .expectStatus(201)
          .expectBodyContains('data');
        // .inspect();
      });
    });

    describe('Get bookmarks', () => {
      it('should get a list of bookmarks', async () => {
        await pactum
          .spec()
          .get('/bookmarks')
          .withBearerToken('$S{accessToken}')
          .expectStatus(200)
          .expectBodyContains('data')
          .expectBodyContains(bookmarkInput.title)
          // ?WE HAVE TWO WAYS TO STORE DATA
          // * 1: store data with key and the path to get that value of data from response or request body or something like that
          // * path: can be chaining by we use the array way or object way also true
          // * body: {status: '', data: { bookmarks: [ { id, title,... } ] }}
          // * => [data].bookmarks[0].id, the first level is req.body, so we can use [data] to get that from req.body first level and then chaining to get the value we want
          .stores('bookmarkId', '[data].bookmarks[0].id');

        // * 2: store as use the callback and instead write the path to scan and get value we can take the response and get the value from it
        // * https://pactumjs.github.io/api/requests/stores.html#using-custom-function
        // .stores((req, res) => {
        // console.log(res.body.data);
        //   return {
        //     bookmarkId: res.body.data.bookmarks[0].id,
        //   };
        // });
      });
    });

    describe('Get specific bookmark', () => {
      it('should throw an error if the id is invalid', async () => {
        await pactum
          .spec()
          .get('/bookmarks/{id}')
          .withPathParams('id', 'invalid_id')
          .withBearerToken('$S{accessToken}')
          .expectStatus(400)
          .expectBodyContains('message');
      });

      it('should throw an error if the id of bookmark not exist', async () => {
        await pactum
          .spec()
          .get('/bookmarks/{id}')
          .withPathParams('id', 12345678)
          .withBearerToken('$S{accessToken}')
          .expectStatus(404)
          .expectBodyContains('message');
      });

      it('should get a bookmark', async () => {
        await pactum
          .spec()
          .get('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withBearerToken('$S{accessToken}')
          .expectStatus(200)
          .expectBodyContains('data');
      });
    });

    describe('Update a bookmark', () => {
      it('should throw an error if the id is invalid', async () => {
        await pactum
          .spec()
          .patch('/bookmarks/{id}')
          .withPathParams('id', 'invalid_id')
          .withBearerToken('$S{accessToken}')
          .expectStatus(400)
          .expectBodyContains('message');
      });

      it('should throw an error if the id of bookmark not exist', async () => {
        await pactum
          .spec()
          .patch('/bookmarks/{id}')
          .withPathParams('id', 12345678)
          .withBearerToken('$S{accessToken}')
          .expectStatus(404)
          .expectBodyContains('message');
      });

      // it('should throw an error if the required input fields are empty', async () => {
      //   await pactum
      // ! usually that when we update we don't write anything like this it will catch error by front-end but in backend we usually write optional for all fields when update
      // ! because the meaning that we can update it or not, but it should include when define that and want to update the field if the field is required it should be not empty ( this can be handle in front-end )
      // * THIS IS CONSIDERATION: SO WHEN WE STORE DATA LIKE THIS { title: '', link: '', description: '' } IT WILL WORK IN BACKEND IF IT'S NOT HANDLE FROM FRONT-END AND WE DON'T WANT THAT RIGHT
      // * SO THIS IS CONSIDERATION
      //     .spec()
      //     .patch('/bookmarks/{id}')
      //     .withPathParams('id', '$S{bookmarkId}')
      //     .withBearerToken('$S{accessToken}')
      //     .withBody({ title: '', link: '', description: '' })
      //     .expectStatus(400)
      //     .expectBodyContains('message');
      // });

      it('should throw an error if the input fields are invalid', async () => {
        await pactum
          .spec()
          .patch('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withBearerToken('$S{accessToken}')
          .withBody({ ...bookmarkInput, title: 1234, link: 1234 })
          .expectStatus(400)
          .expectBodyContains('message');
      });

      it('should update bookmark', async () => {
        await pactum
          .spec()
          .patch('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withBearerToken('$S{accessToken}')
          .withBody({
            ...bookmarkInput,
            title: 'New Title',
            link: 'new_link',
          })
          .expectStatus(200)
          .expectBodyContains('data');
        // .inspect();
      });
    });

    describe('Delete a bookmark', () => {
      it('should throw an error if the id is invalid', async () => {
        await pactum
          .spec()
          .delete('/bookmarks/{id}')
          .withPathParams('id', 'invalid_id')
          .withBearerToken('$S{accessToken}')
          .expectStatus(400)
          .expectBodyContains('message');
      });

      it('should throw an error if the id of bookmark not exist', async () => {
        await pactum
          .spec()
          .delete('/bookmarks/{id}')
          .withPathParams('id', 12345678)
          .withBearerToken('$S{accessToken}')
          .expectStatus(404)
          .expectBodyContains('message');
      });

      it('should delete a bookmark', async () => {
        await pactum
          .spec()
          .delete('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withBearerToken('$S{accessToken}')
          .expectStatus(204)
          .expectBody(null);
      });

      it('should get an empty list of bookmarks', async () => {
        await pactum
          .spec()
          .get('/bookmarks')
          .withBearerToken('$S{accessToken}')
          .expectStatus(200)
          .expectBodyContains('data')
          .expectBodyContains([]);
      });
    });
  });

  // * CONSIDER THE SITUATION LIKE: THE ACCESS TOKEN EXPIRES AND NEED TO SEND REQUEST TO REFRESH ENDPOINT TO UPDATE ACCESS TOKEN AND CONTINUE USE THE APP

  describe('Auth', () => {
    describe('Refresh', () => {
      it('should throw an error if access token invalid (expires, invalid....)', async () => {
        await pactum
          .spec()
          .get('/auth/logout')
          .withBearerToken('invalid_access_token')
          .expectStatus(401)
          .expectBodyContains('message');
      });

      it('should throw an error if refresh token is invalid (expires, invalid....)', async () => {
        await pactum
          .spec()
          .get('/auth/refresh')
          .withBearerToken('invalid_refresh_token')
          .expectStatus(401)
          .expectBodyContains('message');
      });

      it('should update the access token', async () => {
        await pactum
          .spec()
          .get('/auth/refresh')
          .withBearerToken('$S{refreshToken}')
          .expectStatus(200)
          .expectBodyContains('token')
          .stores('accessToken', 'token');
      });
    });

    describe('Logout', () => {
      it('should logout user', async () => {
        await pactum
          .spec()
          .get('/auth/logout')
          .withBearerToken('$S{accessToken}')
          .expectStatus(200);
        // .inspect();
      });
    });
  });
});
