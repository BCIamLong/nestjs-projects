import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateMe {
  @ApiProperty({
    name: 'name',
    type: String,
    default: 'Test User',
  })
  @IsOptional()
  @IsString()
  name: string;

  @ApiProperty({
    name: 'email',
    type: String,
    default: 'test@gmail.com',
  })
  @IsOptional()
  @IsEmail()
  email: string;
}
