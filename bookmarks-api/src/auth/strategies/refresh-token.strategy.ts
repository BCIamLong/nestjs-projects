import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { GetRefreshToken } from '../decorators';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RefreshTokenJWTStrategy extends PassportStrategy(
  Strategy,
  'refresh-token-jwt',
) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('JWT_REFRESH_TOKEN_SECRET'),
      passReqToCallback: true,
    });
  }

  validate(@GetRefreshToken() rt: string, payload: any) {
    return { rt, ...payload };
  }
}
