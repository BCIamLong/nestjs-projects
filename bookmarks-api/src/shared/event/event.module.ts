import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  // * because we this module will add to shared module which is will add to imports of app module, and because shared module is global it will effect to the entire of the app module
  // * in this case we want to setup this even emitter module here then it will become to global together with the shared module right therefore we can setup it here
  // * https://github.com/nestjs/event-emitter#readme
  // * https://github.com/EventEmitter2/EventEmitter2

  // * event emit can be more complex like we can use to patter like push to a queue in AWS, pub sub with Redis and more...
  imports: [EventEmitterModule.forRoot()],
  providers: [EventService],
})
export class EventModule {}
