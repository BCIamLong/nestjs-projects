import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AccessTokenJWTStrategy extends PassportStrategy(
  Strategy,
  'access-token-jwt',
) {
  constructor(
    config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('JWT_ACCESS_TOKEN_SECRET'),
    });
  }

  async validate(payload: any) {
    // { sub: number; email: string }
    const user = await this.prisma.user.findUnique({
      where: {
        id: payload.sub,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        hashedRt: true,
      },
    });

    // * so now we have a problem when we logout we remove the access and refresh tokens but here's thing we just delete the tokens from cookies and also from DB (for hash refresh token)
    // ! but the access token itself if it's still not expires because we don't hash and compare like the refresh token so that means if someone has this access token they can still access until this access token expires
    // * of course we know the access token can have the life time in 5 to 15 minutes right, but it's still not good and dangerous for our app
    // * and to solve this problem we can do something: hash and compare like refresh token, create isLogin field for the user and check it, check combine bearer token, access and refresh token
    // * but in this case of our app we just use very simple that we can check the refresh token hash is exist or not because when user login user must have this hash right
    // * and when user logout we deleted right and it's very good for us to check

    if (!user.hashedRt)
      throw new UnauthorizedException(
        "You don't login yet, please login to perform this action",
      );

    delete user.hashedRt;
    // delete user.password;
    // delete user.passwordConfirm;
    return user;
  }
}
