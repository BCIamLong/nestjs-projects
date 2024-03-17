import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { CreateMessageDto } from './dtos/create-message.dto';
import { MessagesService } from './messages.service';

@Controller('messages')
export class MessagesController {
  constructor(public messagesService: MessagesService) {}

  @Get()
  getMessages() {
    // return 'List of messages';
    return this.messagesService.findAll();
  }

  @Get('/:id')
  async getMessage(@Param('id') id: string) {
    // console.log(id);
    // return 'A message with an id';

    // ! when we use the return keyword with the asynchronous task and return some value like this: return this.messagesService.findOne(id); then we don't need use await to wait the value come and then return
    // * so this is maybe some work behind the scenes of Nestjs and when data don't come then it will be like undefined then return undefined like return nothing right then maybe Nest just ignore this
    // * and then when data come it will return so that's it
    // ! notice that we can use return keyword in this case for that
    // return this.messagesService.findOne(id);

    // ! but here we need to assign the message and do some checking then we need to use async/await here unless if we return this asynchronous task(has to return some value) directly
    const message = await this.messagesService.findOne(id);

    if (!message) throw new NotFoundException('No messages found with this id');

    return message;
  }

  @Post()
  // createMessage(@Body() body: any) {
  createMessage(@Body() body: CreateMessageDto) {
    // console.log(body);
    // return;
    return this.messagesService.create(body.content);
  }
}

// * Before refactor with DI system
/*

export class MessagesController {
  messagesService: MessagesService;

  constructor() {
    this.messagesService = new MessagesService();
  }

  @Get()
  getMessages() {
    // return 'List of messages';
    return this.messagesService.findAll();
  }

  @Get('/:id')
  async getMessage(@Param('id') id: string) {
    // console.log(id);
    // return 'A message with an id';

    // ! when we use the return keyword with the asynchronous task and return some value like this: return this.messagesService.findOne(id); then we don't need use await to wait the value come and then return
    // * so this is maybe some work behind the scenes of Nestjs and when data don't come then it will be like undefined then return undefined like return nothing right then maybe Nest just ignore this
    // * and then when data come it will return so that's it
    // ! notice that we can use return keyword in this case for that
    // return this.messagesService.findOne(id);

    // ! but here we need to assign the message and do some checking then we need to use async/await here unless if we return this asynchronous task(has to return some value) directly
    const message = await this.messagesService.findOne(id);

    if (!message) throw new NotFoundException('No messages found with this id');

    return message;
  }

  @Post()
  // createMessage(@Body() body: any) {
  createMessage(@Body() body: CreateMessageDto) {
    // console.log(body);
    // return;
    return this.messagesService.create(body.content);
  }
}
*/
