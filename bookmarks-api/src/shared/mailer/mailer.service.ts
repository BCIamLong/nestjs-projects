import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import { createTransport } from 'nodemailer';
import { MailOptions } from 'nodemailer/lib/json-transport';

@Injectable()
export class AppMailerService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly config: ConfigService,
  ) {}

  async sendEmail({ to, subject, text }: MailOptions, user: User) {
    try {
      // console.log({ to, subject, text, html });
      // ! so when we get error: no recipients defined => maybe some field related to recipients (nguoi nhan) are not defined like we leave it empty or undefined
      // * therefore we can look and see some fields can be empty or undefined or not and fix that
      // * https://stackoverflow.com/questions/62771346/why-is-there-no-recipients-defined-error  read more
      return this.mailerService.sendMail({
        // from: this.config.get('MAIL_FROM'),
        to,
        subject,
        text: text as string,
        // html: html as string,
        template: './welcome.template.hbs',
        context: { user },
      });
    } catch (err) {
      // ? why we need try catch here are't we have the all exceptions handler?
      // * well that's because if we have errors happen in the file handlebars then the all exceptions handler can't catch those errors right because the handlebars files are out side the app module right
      // * therefore we to catch here if that case happens and handle error here
      throw new InternalServerErrorException('Something went wrong');
      // ! THIS NEEDS TO BE REVIEW, THIS TRY CATCH MAYBE NOT NECESSARY BECAUSE THE ERROR HAPPEN IN HANDLEBARS CAN'T HANDLE IN THE APP, AND IT CAN BE AN UNHANDLED REJECTION ERROR
    }
  }

  newTransport() {
    // * if we have many transport like we want to send email for many transport like for service gmail, other service of email
    // * then that's time we want to config the transport so in that case we can create the newTransport method and add arguments and configuration as we want
    // * then we just use this method to create new transport and just send email as normal like we did in express app
    // * but if we just have one transporter like in this case we can do that in the mailer module so directly in the imports of module or in the app module
    // * but we only use this mail only via this mailer module and service so we should init the transporter in this mailer module
    createTransport({
      // service: '',
      host: this.config.get('MAIL_HOST'),
      port: this.config.get('MAIL_HOST'),
      auth: {
        user: this.config.get('MAIL_USERNAME'),
        pass: this.config.get('MAIL_PASSWORD'),
      },
    } as MailOptions);
  }
}
