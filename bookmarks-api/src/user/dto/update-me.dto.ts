import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateMe {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsEmail()
  email: string;
}
