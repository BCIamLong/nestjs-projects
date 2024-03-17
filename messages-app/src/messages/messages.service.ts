import { Injectable } from '@nestjs/common';
import { MessagesRepository } from './messages.repository';

@Injectable()
export class MessagesService {
  constructor(public messagesRepo: MessagesRepository) {}

  async findOne(id: string) {
    return this.messagesRepo.findOne(id);
  }

  async findAll() {
    return this.messagesRepo.findAll();
  }

  async create(content: string) {
    return this.messagesRepo.create(content);
  }
}

// *================ Before refactor with DI system ============================

// export class MessagesService {
//   messageRepo: MessagesRepository;
//   constructor() {
// * later on we will use dependencies injection to inject dependencies between two classes
// * now the way we're using is import the message repo then create the dependencies of service itself, not inject dependencies from our repository
//     this.messageRepo = new MessagesRepository();
//   }

//   async findOne(id: string) {
//     return this.messageRepo.findOne(id);
//   }

//   async findAll() {
//     return this.messageRepo.findAll();
//   }

//   async create(content: string) {
//     return this.messageRepo.create(content);
//   }
// }
