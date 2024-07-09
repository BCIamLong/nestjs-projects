import { IsNotEmpty, IsString } from 'class-validator';

export class ValidateDTO {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
