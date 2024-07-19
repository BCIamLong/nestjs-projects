import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-facebook';
import { AuthService } from '../auth.service';
import { VerifyCallback } from 'passport-google-oauth20';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(
    readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: config.get('FACEBOOK_CLIENT_ID'),
      clientSecret: config.get('FACEBOOK_CLIENT_SECRET'),
      callbackURL: config.get('FACEBOOK_CLIENT_CALLBACK_URL'),
      scope: 'email',
      profileFields: ['emails', 'name'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ) {
    // console.log('refresh token', refreshToken);
    const { name, emails, photos } = profile;
    const googleUser = {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      picture: photos[0].value,
      accessToken,
    };

    // * check user exits or not in our DB
    const user = await this.prisma.user.findUnique({
      where: {
        email: googleUser.email,
      },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
      },
    });
    // * if exist just ignore
    if (user) done(null, user);

    // * if not exist we need to add the user to our DB
    const newUser = await this.prisma.user.create({
      data: {
        email: googleUser.email,
        name: googleUser.firstName + googleUser.lastName,
        password: accessToken,
      },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
      },
    });

    // * create access token and refresh token
    // * hash refresh token and save to DB

    const tokens = await this.authService.setupTokens({
      id: newUser.id,
      email: newUser.email,
    });

    // ! these three should be done in the auth controller in the google login route right
    // * set cookie for both tokens

    done(null, { ...newUser, ...tokens });
  }
}
