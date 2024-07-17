import { Module } from '@nestjs/common';
import { AppMailerService } from './mailer.service';
import { MailerModule, MailerOptions } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): MailerOptions => {
        return {
          transport: {
            // service: '',
            host: config.get('MAIL_HOST'),
            port: config.get('MAIL_HOST'),
            auth: {
              user: config.get('MAIL_USERNAME'),
              pass: config.get('MAIL_PASSWORD'),
            },
          },
          defaults: {
            // * we can set default value for some options if we want
            from: config.get('MAIL_FROM'),
          },
          template: {
            // "assets": ["assets/templates/**/**"]
            // ? why we need ../../../ because we want to point to the assets folder in src right
            // * second we need to set up nestjs-cli for assets:
            // * "assets": ["assets/templates/**/**"] like this or
            // * "assets": [{ "include": "assets/**/*", "watchAssets": true }] like this
            // * to allow nestjs run and watch the assets
            dir: __dirname + '../../../assets/templates',
            adapter: new HandlebarsAdapter(),
            options: {
              // * if we set strict to true then we can't put the object via the handlebars variable, like we declare {{user.name}} then we pass the user object to the context
              // ! but if strict is true it will limit the data only pass maybe as string or number...
              // ! therefore in this case we will get error when we pass an object
              // strict: true,
              // * and if we want to pass an object we just set strict to false ok
              strict: false,
            },
          },
        };
      },
    }),
  ],
  providers: [AppMailerService],
  exports: [AppMailerService],
})
export class AppMailerModule {}
