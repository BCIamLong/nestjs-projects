import { Global, Module } from '@nestjs/common';
import { AccessControlService } from './access-control.service';
import { AppMailerModule } from './mailer/mailer.module';

@Global()
@Module({
  imports: [AppMailerModule],
  providers: [AccessControlService],
  exports: [AccessControlService, AppMailerModule],
})
export class SharedModule {}
