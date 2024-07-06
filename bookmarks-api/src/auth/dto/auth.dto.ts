// export interface AuthDTO {
//   email: string;
//   password: string;
// }

// ! this is just reference now
// ! because we have login and sign up and two of them have different DTO right we can include these to one file so auth DTO right
// * therefore we need to separate these two login and signup DTOs
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
