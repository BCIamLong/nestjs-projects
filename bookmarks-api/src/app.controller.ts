import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PublicRoute } from './common/decorators';
// import { GoogleGuard } from './auth/guards';
import { GoogleGuard } from './auth/guards';

@ApiTags('app')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({ summary: 'Health check' })
  @ApiResponse({ status: 200, description: 'Ok' })
  @PublicRoute()
  @Get('/health-check')
  healthCheck(): string {
    return this.appService.healthCheck();
  }

  // ! this is just for test so we use localhost:5000 as the  url to render the google form to login page, of course maybe in the server side rendering (SSR) it will work like this
  // * but if we use maybe react app + this API we should put this url to like: localhost:5137 right and form react app we will send the request to this google service and it will check that request and then send the request to the google callback route
  // * and in this route we can do something like get user info check if user exists or not and maybe store user to our DB, update access and refresh tokens....
  // * and then in the last we will redirect to the homepage, maybe because well we are logging in right
  @PublicRoute()
  @UseGuards(GoogleGuard)
  @Get()
  async googleUi() {}
}
