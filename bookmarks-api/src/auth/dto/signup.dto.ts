import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SignupDTO {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
