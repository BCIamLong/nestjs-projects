import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateBookmark {
  // @ApiProperty({
  //   description: 'The title of bookmark',
  //   example: 'Test Bookmark Title',
  // })
  // * we can do it like the way above it works the same as the way bellow
  @ApiProperty({
    name: 'title',
    type: String,
    description: 'The title of bookmark',
    example: 'Test Bookmark Title',
    // default: 'Test Bookmark Title', //* default or example will be work as well
  })
  @IsOptional()
  @IsString()
  title: string;

  @ApiProperty({
    name: 'link',
    type: String,
    default: 'link',
  })
  @IsOptional()
  @IsString()
  link: string;

  @ApiProperty({
    name: 'description',
    type: String,
    default: 'Description of test bookmark',
  })
  @IsOptional()
  @IsString()
  description: string;
}
