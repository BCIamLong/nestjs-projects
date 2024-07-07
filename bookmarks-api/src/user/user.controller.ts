import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JWTGuard } from 'src/auth/guards';
// import { AuthGuard } from '@nestjs/passport';

@Controller('users')
export class UserController {
  // * So strategy is just like the condition to verify
  // * And the guard is just the way we setup the verify process happen like we do if else and then throw exception or allow the pass so something like that
  // * AuthGuard is the built-in guard in @nestjs/passport package but we can also have our own guards so we can create our own guard or custom guard, custom guard from other package...

  // * to make this AuthGuard('jwt') more specific and without cases like we write jwt-token, jwt-guard... so maybe we can write wrong we can extract it to a class
  // @UseGuards(AuthGuard('jwt'))
  // * and use this class like this with this way it's more specific and more readable easy to understand right
  @UseGuards(JWTGuard)
  @Get('me')
  getMe(@Req() req: Request) {
    // return 'Current user';

    // * we can use this req.user because after we login or signup we validate the token and we will take the payload and fetch the user and return the user data
    // * which is will be assign to the req.user right so now we can use this req.user data
    return req.user;
  }
}
