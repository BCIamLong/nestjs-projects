import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
// import { Request } from 'express';
import { GetUser } from 'src/auth/decorators';
import { JWTGuard } from 'src/auth/guards';
import { UserService } from './user.service';
import { UpdateMe } from './dto';
import { Roles } from 'src/common/decorators';
import { Role } from 'src/common/enums';
import { RolesGuard } from 'src/common/guards';
// import { AuthGuard } from '@nestjs/passport';

@Roles(Role.ADMIN, Role.MANAGER)
@UseGuards(RolesGuard)
@UseGuards(JWTGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}
  // * So strategy is just like the condition to verify
  // * And the guard is just the way we setup the verify process happen like we do if else and then throw exception or allow the pass so something like that
  // * AuthGuard is the built-in guard in @nestjs/passport package but we can also have our own guards so we can create our own guard or custom guard, custom guard from other package...

  // * to make this AuthGuard('jwt') more specific and without cases like we write jwt-token, jwt-guard... so maybe we can write wrong we can extract it to a class
  // @UseGuards(AuthGuard('jwt'))
  // * and use this class like this with this way it's more specific and more readable easy to understand right
  // @UseGuards(JWTGuard)
  @Get('me')
  // ? we need to solve this problem so the @Req decorator because remember this can be problem because nestjs under the hood can use different http server library right like express, fastify... and maybe in the future it will change another
  // * therefore to make sure it always work we shouldn't use @Req but instead we can custom the @Req decorator (we can custom param decorators)
  // getMe(@Req() req: Request) {
  // getMe(@GetUser('email') email: string) {
  getMe(@GetUser() user: User) {
    // return 'Current user';

    // * we can use this req.user because after we login or signup we validate the token and we will take the payload and fetch the user and return the user data
    // * which is will be assign to the req.user right so now we can use this req.user data
    // return req.user;
    // return email
    return user;
  }

  // * so instead of make the @UseGuards(JWTGuard) in everywhere at level route we can put it at the level of controller and it will apply for all routes in this controller
  // * we also have global guard and we can use it for our entire app so entire routes in our app
  // @UseGuards(JWTGuard)
  @Patch('me')
  updateMe(@GetUser() user: User, @Body() dto: UpdateMe) {
    return this.userService.updateMe(user.id, dto);
  }
}
