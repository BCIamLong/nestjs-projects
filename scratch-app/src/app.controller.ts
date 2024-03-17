import { Controller, Get } from "@nestjs/common";

@Controller("/app")
export class AppController {
  @Get("/")
  getRootRoute() {
    return "Hello world";
  }

  @Get("/home")
  getHomepage() {
    return "Homepage";
  }
}
