import { User } from '@prisma/client';

export class UserCreatedEvent {
  constructor(
    public readonly subject: string,
    public readonly user: User,
  ) {}
}
