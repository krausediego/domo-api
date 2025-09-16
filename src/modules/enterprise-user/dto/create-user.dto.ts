import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ArrayMinSize, IsArray, IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

import { lowerCaseTransformer } from '@/utils/transformers';

export class CreateUserDto {
  @ApiProperty({
    example: 'test1@example.com',
    type: String,
  })
  @Transform(lowerCaseTransformer)
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @MinLength(8)
  password: string;

  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  @IsNotEmpty()
  roles: string[];
}
