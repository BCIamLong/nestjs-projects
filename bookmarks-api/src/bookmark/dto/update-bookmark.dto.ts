import { IsOptional, IsString } from 'class-validator';

export class UpdateBookmark {
  @IsOptional()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  link: string;

  @IsOptional()
  @IsString()
  description: string;
}
