import { readFile, writeFile } from 'fs/promises';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MessagesRepository {
  async findOne(id: string) {
    try {
      const message = await readFile('messages.json', 'utf-8');

      return JSON.parse(message)[id];
    } catch (err) {
      throw err;
    }
  }

  async findAll() {
    try {
      const messages = await readFile('messages.json', 'utf-8');
      //   console.log(messages);
      console.log(JSON.parse(messages));
      //   if (messages === '') return;
      return JSON.parse(messages);
    } catch (err) {
      throw err;
    }
  }

  async create(content: string) {
    try {
      const messages = await this.findAll();

      // * way 1
      const newId = Math.floor(Math.random() * 1000) + 1;

      messages[newId] = { id: newId, content };

      // * way 2
      //   const newId = messages[-1]?.id + 1;

      //   const newMessages = messages[1]
      //     ? {
      //         ...messages,
      //         [newId]: { id: newId, content },
      //       }
      //     : { 1: { id: 1, content } };
      //   await writeFile('messages.json', JSON.stringify(newMessages));

      await writeFile('messages.json', JSON.stringify(messages));
      console.log('add successfully');
    } catch (err) {
      throw err;
    }
  }
}

// * test it work or not
// const test = new MessagesRepository();
// test.create('Hello 123');
// test.findAll();
