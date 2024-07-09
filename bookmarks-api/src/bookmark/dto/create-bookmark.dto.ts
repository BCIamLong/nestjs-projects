import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateBookmark {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  link: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsNumber()
  userId: number;
}
