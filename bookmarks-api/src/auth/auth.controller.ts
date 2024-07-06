import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
// import { Request } from 'express';
import { LoginDTO, SignupDTO } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private AuthService: AuthService) {}

  // ! we shouldn't use @Req like this why because when we use this we need to import the type of request from the framework underlying so in this case that's express and the request is the request object of express
  // ? but what if we use another framework, what if our app will change the framework underlying instead of express
  // * so we need to go and change every places we use this request to the type of the request of that new framework right which is not good
  // @Post('login')
  // login(@Req() req: Request) {
  //   console.log(req.body);
  //   return this.AuthService.login();
  // }

  // * therefore we use use @Body decorator which is allow us access to the body of the request (flexible and access to any framework underlying, if the framework change it's not problem)
  @Post('login')
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
  login(@Body() dto: LoginDTO) {
    return this.AuthService.login(dto);
  }

  @Post('signup')
  signup(@Body() dto: SignupDTO) {
    return this.AuthService.signup(dto);
  }
}
