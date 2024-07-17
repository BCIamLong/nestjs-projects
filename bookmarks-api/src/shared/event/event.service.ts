import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AppMailerService } from '../mailer/mailer.service';
import { UserCreatedEvent } from '../../common/events';

@Injectable()
export class EventService {
  constructor(private readonly mailService: AppMailerService) {}

  // * so we can setup as async to true if we want it async task right
  @OnEvent('user.created', { async: true })

  // ! one thing we need to notice that how can we make sure the emit() will send the payload with { subject: string; user: User } type ? right we can ensure that right when we use this.evenEmitter.emit() right
  // * and usually we will create a class refresh for this event payload like in this case we can create
  // * user-created.event.ts in the events folder
  // * and use that class to create new instance new UserCreatedEvent(subject, user)
  // sendWelcome({ subject, user }: { subject: string; user: User }) {
  // * and in here instead use { subject: string; user: User } we can use UserCreatedEvent right
  // * so it's kind like DTO right but this is for event and also this is just normal class and don't use class validator and class transformer
  sendWelcome({ subject, user }: UserCreatedEvent) {
    // console.log(subject, user);
    this.mailService.sendEmail(subject, user);

    // * and with async we can able go get the value from this emit function
    // * so we can return in here
    // return 1;
    // * and then we can use  this.eventEmitter.emitAsync() to get the value

    // ! if we use just  this.eventEmitter.emit() and just use the sync way then we can't get the value from this handle event function

    // * in this case we don't need to get the value from this handle event therefore we can don't return anything
  }

  @OnEvent('user.created', { async: true })
  doAnotherThing() {
    // * we can also have many handlers for one event and the event handlers will run by order from above to bellow
    // * in this case sendWeCome() run first and then doAnotherThing() run second
    // * but if we make it to async then it might change the order if in the async handle really have task take some time, if it's just async handler but don't do any async task then well it's fake async and it's sync function right
    console.log('Send email success');
  }

  @OnEvent('user.created', { async: true })
  doAnotherThing3() {
    console.log('Hello 123');
  }
}
