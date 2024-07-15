import {
  Body,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { BaseService } from './base.service';
import { Pagination } from 'src/common/dto';
// import { Reflector } from '@nestjs/core';

// ? how we can tell this base class what is the route we should use public route and also use other decorators like Roles...
// ? how we can apply decorators from outside to this class?

export class BaseController<Model, CreateDTO, UpdateDTO> {
  constructor(
    private readonly baseService: BaseService<Model, CreateDTO, UpdateDTO>,
    // ! we don't need to use reflector here because when we use @Controller on the controller class extends from this BaseController class then this class will be controller class and itself has the reflector dependency inject so therefore we don't need to implement it again
    // * because the idea here is because BaseController class we don't use @Controller to make it become the controller class because this is just class we want to extend
    // * and we make the reflector to it can read metadata from decorators or something like that right, but when we use @Controller on the class which extended from this BaseController class then it will be controller class of nestjs and itself has the reflector dependency inject right
    // private readonly reflector: Reflector,
  ) {}

  @Get()
  findAll(@Query() query: Pagination) {
    return this.baseService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.baseService.findOne(id);
  }

  @Post()
  createOne(@Body() dto: CreateDTO) {
    return this.baseService.createOne(dto);
  }

  @Patch(':id')
  updateOne(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateDTO) {
    return this.baseService.updateOne(id, dto);
  }

  @Delete(':id')
  deleteOne(@Param('id', ParseIntPipe) id: number) {
    return this.baseService.deleteOne(id);
  }
}
