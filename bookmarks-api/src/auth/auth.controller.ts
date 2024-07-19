import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
  // UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
// import { Request } from 'express';
import { LoginDTO, SignupDTO } from './dto';
import {
  PublicRoute,
  // SetCookie,
  SkipGlobalInterceptor,
} from 'src/common/decorators';
import { GetRefreshToken, GetUser } from './decorators';
import { GoogleGuard, RefreshTokenGuard } from './guards';
import { ApiTags } from '@nestjs/swagger';
// import { SetCookieFnc } from 'src/common/types';
import { Response } from 'express';
import { User } from '@prisma/client';
// import { LocalGuard } from './guards';
// import { GetUser } from './decorators';
// import { User } from '@prisma/client';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // ! we shouldn't use @Req like this why because when we use this we need to import the type of request from the framework underlying so in this case that's express and the request is the request object of express
  // ? but what if we use another framework, what if our app will change the framework underlying instead of express
  // * so we need to go and change every places we use this request to the type of the request of that new framework right which is not good
  // @Post('login')
  // login(@Req() req: Request) {
  //   console.log(req.body);
  //   return this.AuthService.login();
  // }
  @SkipGlobalInterceptor()
  // * therefore we use use @Body decorator which is allow us access to the body of the request (flexible and access to any framework underlying, if the framework change it's not problem)
  @Post('local/login')
  // ! we should use local/login because later on we might have login with google, facebook.... and it will be google/login, facebook/login... right and it makes our code more organization
  // ! https://docs.google.com/document/d/1fVpBFz4gzIAC8h-YgdMUuBVdOJpyIVUU_3RGLVDW7Ck/edit read this
  // ? but how we can validate in nestjs, maybe we can use if else, guard clause to check but it's not good enough right instead we use something in nestjs called pipes
  // login(
  // * we can do it like this by manually way but it's not good right because we need to write and declare these pipes in every our route our controller function right so everywhere we want to use the pipes right
  // * but it's not good way we need another way because now we have our DTO with typescript type we can do something with it maybe combine it with pipe then we just use our type and don't need to worry about validate
  // * @Body() dto: AuthDTO so like this and AuthDTO will do type check and also validate with pipe
  //   @Body('email') email: string,
  //   @Body('password', ParseIntPipe) password: string,
  // ) {
  //   console.log({
  //     dto,
  //   });
  // }
  // * so by default in nestjs the post method protocol send the status code is 201 but sometime we have the cases we use post method but it's not create new value right so therefore we want to custom it
  // * so in this case login doesn't create new value so we can custom it by use @HttpCode decorator, of course we can use @Res decorator but it's like problem of the @Req decorator right
  // @HttpCode(200)
  // * and we can use HttpStatus object from nestjs to see the status we want to use and it will return the status code for use in case we don't remember the status code right and maybe it will make the code more readable
  @HttpCode(HttpStatus.OK)
  // @UseGuards(LocalGuard)
  // login(@GetUser() user: User) {
  // ! we will use LocalGuard in case we want to login with username
  // * basically we extract the login to this local strategy and then just get the user and do something like just return the token
  //   return this.authService.signToken({sub: user.id, email: user.email});
  // }
  @PublicRoute()
  login(@Body() dto: LoginDTO) {
    return this.authService.login(dto);
  }

  @SkipGlobalInterceptor()
  @PublicRoute()
  @Post('local/login1')
  async login1(
    @Body() dto: LoginDTO,
    @Res({ passthrough: true }) res: Response,
  ) {
    // * this for test access token and refresh token way
    const { accessTokenObj, refreshTokenObj } =
      await this.authService.login1(dto);

    const commonOptions = {
      httpOnly: true,
      // secure: false,
    };

    //* now we need to use this way to set cookie so basically we need to use res directly to use cookie
    res.cookie('access-token', accessTokenObj.token, {
      expires: new Date(
        Date.now() + Number(this.authService.access_token_expires),
      ),
      ...commonOptions,
    });
    res.cookie('refresh-token', refreshTokenObj.token, {
      expires: new Date(
        Date.now() + Number(this.authService.refresh_token_expires),
      ),
      ...commonOptions,
    });

    // !  @Res({ passthrough: true }) when we use res directly nestjs will allow us to modify the response so basically it will not automatically send response for us like this (2)
    // * but we need to use (2) to send response but if we don't want we can use @Res({ passthrough: true }) with option passthrough allow the default behavior so send response automatically
    // res.json(accessTokenObj); //*(1)
    // return accessTokenObj; //*(2)
    return accessTokenObj; //* so now we can use this way when we do @Res({ passthrough: true })
  }

  @PublicRoute()
  @SkipGlobalInterceptor()
  @Post('signup')
  signup(@Body() dto: SignupDTO) {
    if (dto.passwordConfirm !== dto.password) throw new BadRequestException();
    return this.authService.signup(dto);
  }

  @PublicRoute()
  @SkipGlobalInterceptor()
  @Post('signup1')
  async signup1(
    @Body() dto: SignupDTO,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (dto.passwordConfirm !== dto.password) throw new BadRequestException();

    const { accessTokenObj, refreshTokenObj } =
      await this.authService.signup1(dto);

    this.setCookies(res, accessTokenObj.token, refreshTokenObj.token);

    return accessTokenObj;
  }

  // * the idea of refresh token is just:
  // * 1, we have routes refresh, login, signup, logout
  // * 2, when we login or signup we will create the access, refresh tokens and set them as cookie, hash refresh token and store in the DB, only return access token
  // * 3, on the client we will take the tokens from cookie so if access-token is not here then just make the request to the /refresh route with refresh-token, after check if pass we update the new access-token and send it back and also set to the cookie
  // * in that time user can access again, so basically if access-token expires we will send back to server and with refresh token to update the access-token then client use that access-token to access our app
  // *4, logout will delete the refresh-token and access token cookies and also delete the hashed refresh token from our DB

  @Get('logout')
  logout(@GetUser('id') id: number, @Res({ passthrough: true }) res: Response) {
    this.authService.logout(id);

    // * remove access-token and refresh-token cookies
    res.clearCookie('access-token');
    res.clearCookie('refresh-token');

    return null;
  }

  @PublicRoute()
  @UseGuards(RefreshTokenGuard)
  @SkipGlobalInterceptor()
  @Get('refresh')
  async refresh(
    @GetUser('sub') id: number,
    @GetRefreshToken() refreshToken: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const accessTokenOb = await this.authService.refresh(id, refreshToken);

    res.cookie('access-token', accessTokenOb.token, {
      expires: new Date(
        Date.now() + Number(this.authService.access_token_expires),
      ),
      ...this.authService.commonCookieOptions,
    });

    return accessTokenOb;
  }

  setCookies(res: Response, accessToken: string, refreshToken: string) {
    //* now we need to use this way to set cookie so basically we need to use res directly to use cookie
    res.cookie('access-token', accessToken, {
      expires: new Date(
        Date.now() + Number(this.authService.access_token_expires),
      ),
      ...this.authService.commonCookieOptions,
    });
    res.cookie('refresh-token', refreshToken, {
      expires: new Date(
        Date.now() + Number(this.authService.refresh_token_expires),
      ),
      ...this.authService.commonCookieOptions,
    });
  }

  @PublicRoute()
  @UseGuards(GoogleGuard)
  @Get('google/login')
  googleLogin(@GetUser() user: User) {
    return user;
  }
}
