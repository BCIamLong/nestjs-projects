import { Injectable } from '@nestjs/common';
import { PowerService } from 'src/power/power.service';

@Injectable()
export class CpuService {
  constructor(public powerService: PowerService) {}

  compute(data: string) {
    this.powerService.supplyPower(300);
    console.log(`Compute ${data} successfully`);
  }
}
