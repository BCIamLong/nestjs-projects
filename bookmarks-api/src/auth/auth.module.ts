import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
// import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  // * when we make the PrismaModule to global by using Global() then we don't need to imports like this because now it's global and we can use dependency injection without imports right
  // * constructor(private prisma: PrismaService) {} and we just use dependence injection like this and don't worry about imports right because now the PrismaModule is global right
  // imports: [PrismaModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
