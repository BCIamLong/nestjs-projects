import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import {
  AccessTokenJWTStrategy,
  GoogleStrategy,
  JWTStrategy,
  LocalStrategy,
  RefreshTokenJWTStrategy,
} from './strategies';
// import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  // * when we make the PrismaModule to global by using Global() then we don't need to imports like this because now it's global and we can use dependency injection without imports right
  // * constructor(private prisma: PrismaService) {} and we just use dependence injection like this and don't worry about imports right because now the PrismaModule is global right
  // imports: [PrismaModule],
  imports: [
    // * because we have refresh and access token and both of them have different secret and expiration time right therefore we will not set the option for that in here for general case
    // * we will setup later in the service where we use jwt service to sign token, verify token...
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JWTStrategy,
    LocalStrategy,
    // ! remember that always provide provider when we want to use something, so in this case we want to use google strategy right so we can't just declare it and it will be use
    // * because when we use AuthGuard('google') we misunderstand that it will happen automatically but it's just abstract and underneath the hood it still need something to configure for work right
    // * because we want to use google strategy and more specific in side the auth module therefore we need to provide it as provider in this case
    // * if it's outside module we need to import it
    GoogleStrategy,
    AccessTokenJWTStrategy,
    RefreshTokenJWTStrategy,
  ],
})
export class AuthModule {}
