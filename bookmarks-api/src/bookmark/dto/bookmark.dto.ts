import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class BookmarkDTO {
  @ApiProperty({
    name: 'id',
    type: Number,
    description: 'The id of bookmark',
  })
  id: number;

  @ApiProperty({
    name: 'title',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    name: 'link',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  link: string;

  @ApiProperty({
    name: 'description',
    type: String,
  })
  @IsOptional()
  @IsString()
  description: string;

  @ApiProperty({
    name: 'userId',
    type: Number,
  })
  @IsNotEmpty()
  @IsNumber()
  userId: number;
}
