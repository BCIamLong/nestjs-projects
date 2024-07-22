import { DynamicModule, Module, Provider } from '@nestjs/common';
import Stripe from 'stripe';

// * THE FIRST WAY WE MAKE THE DYNAMIC MODULE AND USE
// * DYNAMIC MODULE USUALLY WE WANT TO USE THE THIRD PARTY LIBRARY BY THIS LIBRARY DOESN'T HAVE THE INTEGRATION IN NESTJS YET, LIKE WE HAVE @nestjs/mailer... AND IT ALREADY HAS THE dynamic setup
// * SO IT HAS THE forRoot method already and many other method like forRootAsync...

// ! BUT WITH THE THIRD LIBRARY DOESN'T HAVE THAT ALREADY INTEGRATION WITH NESTJS LIKE IN THIS CASE WE USE STRIPE and we don't have @nestjs/stripe right
// * THEREFORE WE CAN SETUP THE DYNAMIC MODULE WITH STRIPE FOR MAKE IT MORE REUSABLE AND EFFICIENT CODE

// ! THIS IS THE FIRST WAY WHEN WE CONFIG STRIPE OBJECT AND RETURN ITSELF THEN USE IT DIRECTLY

// ? THE SECOND WAY MAYBE CREATE THE STRIPE SERVICE AND IN THAT SERVICE INIT THE STRIPE OBJECT AND CREATE MANY METHOD USING THIS STRIPE OBJECT AND WE JUST EXPORT THIS SERVICE
// * AND USE IT IN OTHER MODULE AND CALL THE METHODS WE DEFINED TO DO SOMETHING SO IT'S LIKE WE ABSTRACT THE USE OF STRIPE OBJECT RIGHT INSTEAD USE IT DIRECTLY WE USE IT VIA THE SERVICE

@Module({})
export class Stripe1Module {
  static forRoot(apiKey: string, config: Stripe.StripeConfig): DynamicModule {
    const stripe = new Stripe(apiKey, config);
    const stripeProvider: Provider = {
      provide: 'STRIPE_CLIENT',
      useValue: stripe,
    };

    return {
      module: Stripe1Module,
      providers: [stripeProvider],
      exports: [stripeProvider],
      global: true,
    };
  }
}
