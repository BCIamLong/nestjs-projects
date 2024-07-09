import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private authService: AuthService) {
    super();
  }

  // * basically we extract the login to this local strategy and then just get the user and do something like just sign the token and return it so this just reduce the logics in the login function
  // * and of course we don't need to that and just write logics in the login function and then it's work as normal
  // ! remember this is should use for username and if we use email then we just do the logics in the login function
  // ! of course we can use username then we use its value for email to login email but the code is not readable right and also not good
  // validate(username: string, password: string) {
  //   return this.authService.validateUser({ email: username, password }); //! so this is not readable and not good
  // }

  // * username and password here is the name convention therefore we can't make this like email: string so it will not work if we use with this local strategy
  // * therefore this only use when we want to login by username or maybe some task need verify username and password like this
  validate(username: string, password: string) {
    return this.authService.validateUser({ username, password });
  }
}
