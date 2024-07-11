import { HttpException, HttpStatus } from '@nestjs/common';

export class ExampleException extends HttpException {
  constructor() {
    // super(msg, statusCode)
    super('Example msg', HttpStatus.NOT_FOUND);
  }
  // constructor(msg: string, statusCode: number) {
  //   // super(msg, statusCode)
  //   super(msg, statusCode);
  // }
}
