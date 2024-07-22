import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Bookmark, User } from '@prisma/client';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;
  private baseServerUrl: string;

  constructor(private readonly config: ConfigService) {
    this.baseServerUrl = config.get('SERVER_ORIGIN');
    this.stripe = new Stripe(config.get('STRIPE_SECRET_KEY'), {
      apiVersion: '2024-06-20',
    });
  }

  async getCheckoutSessionUrl(bookmark: Bookmark, userPayload: User) {
    const { id: bookmarkId, title, description, link } = bookmark;
    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      success_url: `${this.baseServerUrl}`,
      cancel_url: `${this.baseServerUrl}/bookmarks/${bookmarkId}`,
      customer_email: userPayload.email,
      client_reference_id: `${bookmarkId}`,
      line_items: [
        {
          price_data: {
            unit_amount: 1 * 100,
            currency: 'usd',
            product_data: {
              name: title,
              description,
              images: ['link-of-image'],
            },
          },
          quantity: 1,
        },
      ],
      locale: 'en',

      metadata: {
        link,
      },
    });

    return session.url;
  }

  // ! THIS WEBHOOK ONLY WORKS ON PRODUCTION WHEN OUR PRODUCT IS LIVE ON INTERNET
  // * OR MAYBE WE CAN USE NGROK FOR MAKE THE LOCALHOST CAN LIVE IN THE INTERNET MAYBE IT WORK I DON'T NOW? LET'S CONSIDER THAT
  webhookCheckout(signature: string, body: string | Buffer) {
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        body,
        signature,
        this.config.get('STRIPE_WEBHOOK_CHECKOUT_SECRET'),
      );
    } catch (err: any) {
      throw err;
    }

    if (event.type === 'checkout.session.completed')
      this.createBookingWebhookCheckout(event.data.object);

    return { received: true };
  }

  createBookingWebhookCheckout(data: Stripe.Checkout.Session) {
    // * do something like create booking and save to the DB
    console.log(data);
  }
}
