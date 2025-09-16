import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';

import { Enterprise } from './domain';
import { CreateEnterpriseDto } from './dto';
import { EnterpriseService } from './enterprise.service';

@ApiBearerAuth()
@ApiTags('Enterprises')
@Controller({
  path: 'enterprises',
  version: '1',
})
export class EnterpriseController {
  constructor(private readonly enterpriseService: EnterpriseService) {}

  @ApiCreatedResponse({
    type: Enterprise,
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createEnterpriseDto: CreateEnterpriseDto): Promise<void> {
    return this.enterpriseService.create(createEnterpriseDto);
  }
}
