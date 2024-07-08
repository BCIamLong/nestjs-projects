import { Injectable } from '@nestjs/common';
import { UpdateMe } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}
  async updateMe(id: number, data: UpdateMe) {
    const updatedUser = await this.prisma.user.update({
      where: {
        id,
      },
      data,
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    // delete updatedUser.password;
    // delete updatedUser.passwordConfirm;
    // * we can also use select in query to filter the fields we want

    return updatedUser;
  }
}
