import { Injectable, NestMiddleware } from '@nestjs/common';
import * as bodyParser from 'body-parser';

@Injectable()
export class RawBodyMiddleware implements NestMiddleware {
  use(req: any, res: any, next: (error?: Error | any) => void) {
    bodyParser.raw({ type: '*/*' })(req, res, next);
  }
}
