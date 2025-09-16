import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsDefined,
  IsEmail,
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';

import { lowerCaseTransformer } from '@/utils/transformers';

class EnterpriseUserAdminDto {
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
}

export class CreateEnterpriseDto {
  @ApiProperty()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'test1@example.com',
    type: String,
  })
  @Transform(lowerCaseTransformer)
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  cellPhone: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  description: string;

  @ApiProperty()
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => EnterpriseUserAdminDto)
  user: EnterpriseUserAdminDto;
}
