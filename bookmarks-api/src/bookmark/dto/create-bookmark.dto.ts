import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateBookmark {
  @ApiProperty({
    name: 'title',
    type: String,
    default: 'Test Bookmark',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    name: 'link',
    type: String,
    default: 'link',
  })
  @IsNotEmpty()
  @IsString()
  link: string;

  @ApiProperty({
    name: 'description',
    type: String,
    default: 'Test Bookmark description',
  })
  @IsOptional()
  @IsString()
  description: string;

  @ApiProperty({
    name: 'userId',
    type: Number,
    default: 123,
  })
  @IsNotEmpty()
  @IsNumber()
  userId: number;
}
