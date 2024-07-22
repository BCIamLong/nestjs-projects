import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;
  constructor(config: ConfigService) {
    this.stripe = new Stripe(config.get('STRIPE_SECRET_KEY'), {
      apiVersion: '2024-06-20',
    });
  }
}
