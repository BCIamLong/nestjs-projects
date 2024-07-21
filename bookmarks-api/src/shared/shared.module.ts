import { Global, Module } from '@nestjs/common';
import { AccessControlService } from './access-control.service';
import { AppMailerModule } from './mailer/mailer.module';
import { EventModule } from './event/event.module';
import { LoggerModule } from './logger/logger.module';

@Global()
@Module({
  // ! the event module we just setup the event emitter and event service is just the place we place all the events catcher
  // * so therefore we don't use or inject the event service or the event module in other one therefore we don't need to put the EventModule to exports right
  imports: [AppMailerModule, EventModule, LoggerModule],
  providers: [AccessControlService],
  exports: [AccessControlService, AppMailerModule, LoggerModule],
})
export class SharedModule {}
