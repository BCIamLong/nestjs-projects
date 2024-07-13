import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'src/prisma/prisma.service';

// * So strategy is just like the condition to verify
// * And the guard is just the way we setup the verify process happen like we do if else and then throw exception or allow the pass so something like that

@Injectable()
export class JWTStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // * for Bearer token
      // ignoreExpiration: false, // * by default it's false so we don't need to do this
      secretOrKey: config.get('JWT_ACCESS_TOKEN_SECRET'),
    });
  }

  //* https://docs.nestjs.com/recipes/passport#implementing-passport-jwt
  async validate(payload: { sub: number; email: string }) {
    // * validate function useful is it will assign this payload as the user to the request object
    // * so like we do in express right we authenticate the user then we pass the user data so it's payload in this case to the request object and later on we can use this user data to do something throughout our routes (controllers) right
    const user = await this.prisma.user.findUnique({
      where: {
        id: payload.sub,
      },
    });

    delete user?.password;
    delete user?.passwordConfirm;

    //* because this validate function will take the payload and do something to assign the user to the request object of our app
    // * therefore we can get the user and filter the sensitive and unwanted fields then return the user right and this will assign to the req object
    // ! one notice that if we return null in this function this will automatically know that this is 401 unauthorized error, because we don't have user the user is null then it's 401 unauthorized error right the nestjs passport package will handle this error for us

    // return { userId: payload.sub, email: payload.email };

    // * if the user is not found then it will be null and the error handle of the package will handle this error therefore we don't need handle error in this case
    return user;
    // * and now if the user is have the value => req.user = this user data and we can take this user data from everywhere in our routes and we can use req.user to access to it so like when we develop the express app right
  }
}
