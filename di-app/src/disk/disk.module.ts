import { Module } from '@nestjs/common';
import { DiskService } from './disk.service';
import { PowerModule } from 'src/power/power.module';

@Module({
  providers: [DiskService],
  exports: [DiskService],
  imports: [PowerModule],
})
export class DiskModule {}
