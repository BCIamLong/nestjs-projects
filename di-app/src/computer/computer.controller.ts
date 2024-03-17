import { Controller, Get } from '@nestjs/common';
import { CpuService } from 'src/cpu/cpu.service';
import { DiskService } from 'src/disk/disk.service';

@Controller('computer')
export class ComputerController {
  constructor(
    public cpuService: CpuService,
    public diskService: DiskService,
  ) {}

  @Get('/')
  run() {
    this.diskService.getData();
    this.cpuService.compute('data');
  }
}
