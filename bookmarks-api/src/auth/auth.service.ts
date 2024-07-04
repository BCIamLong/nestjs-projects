import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable({})
export class AuthService {
  constructor(private prisma: PrismaService) {}
  login() {
    return 'Sign in';
  }

  signup() {
    return 'Sign up';
  }
}
