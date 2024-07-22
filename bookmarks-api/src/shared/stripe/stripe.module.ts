import { DynamicModule, Module } from '@nestjs/common';
import { StripeService } from './stripe.service';

@Module({})
export class StripeModule {
  static forRoot(): DynamicModule {
    return {
      module: StripeModule,
      providers: [StripeService],
      exports: [StripeService],
      global: true,
    };
  }
}
