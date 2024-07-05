// export interface AuthDTO {
//   email: string;
//   password: string;
// }

import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

// * https://docs.nestjs.com/pipes#class-validator

export class AuthDTO {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
