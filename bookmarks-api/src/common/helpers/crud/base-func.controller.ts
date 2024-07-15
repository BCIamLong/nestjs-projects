import {
  Body,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Type,
} from '@nestjs/common';
import { BaseService } from './base.service';
import { ApiResult } from 'src/common/decorators';
import { ApiBody } from '@nestjs/swagger';
import { Pagination } from 'src/common/dto';

export function ControllerFactory(
  entityDto: Type,
  createDto: Type,
  updateDto: Type,
) {
  const modelName = entityDto.name
    .slice(0, entityDto.name.indexOf('D'))
    .toLocaleLowerCase();

  class BaseController<Model, CreateDTO, UpdateDTO> {
    constructor(public baseService: BaseService<Model, CreateDTO, UpdateDTO>) {}

    @ApiResult(entityDto, `${modelName}`, 'getAll')
    @Get()
    findAll(@Query() query: Pagination) {
      return this.baseService.findAll(query);
    }

    @ApiResult(entityDto, `${modelName}`, 'getOne')
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
      return this.baseService.findOne(id);
    }

    @ApiResult(entityDto, `${modelName}`, 'create')
    @ApiBody({ type: createDto })
    @Post()
    createOne(@Body() dto: CreateDTO) {
      return this.baseService.createOne(dto);
    }

    @ApiResult(entityDto, `${modelName}`, 'update')
    @ApiBody({ type: updateDto })
    @Patch(':id')
    updateOne(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateDTO) {
      return this.baseService.updateOne(id, dto);
    }

    @ApiResult(entityDto, `${modelName}`, 'delete')
    @Delete(':id')
    deleteOne(@Param('id', ParseIntPipe) id: number) {
      return this.baseService.deleteOne(id);
    }
  }

  return BaseController;
}
