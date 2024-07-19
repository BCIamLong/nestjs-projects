import { AuthGuard } from '@nestjs/passport';

export class FacebookGuard extends AuthGuard('facebook') {
  constructor() {
    super();
  }
}
