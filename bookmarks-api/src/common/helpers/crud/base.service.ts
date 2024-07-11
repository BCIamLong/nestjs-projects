import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from 'src/prisma/prisma.service';

// interface IBaseService<Model extends Prisma.ModelName, CreateDTO, UpdateDTO> {
//   readonly prisma: PrismaService;
//   model: string;

//   findAll(): Promise<Model[]>;
//   findOne(id: number): Promise<Model>;
//   createOne(dto: CreateDTO): Promise<Model>;
//   updateOne(id: number, dto: UpdateDTO): Promise<Model>;
//   deleteOne(id: number): Promise<Model>;
// }

@Injectable()
// export class BaseService<Model extends Prisma.ModelName, CreateDTO, UpdateDTO> {
export class BaseService<Model, CreateDTO, UpdateDTO> {
  private readonly model: string;
  private readonly pluralModelName: string;

  constructor(
    private readonly prisma: PrismaService,
    model: Prisma.ModelName,
  ) {
    this.model = model.toLocaleLowerCase();
    this.pluralModelName = model.toLocaleLowerCase() + 's';
  }

  findAll(): Promise<Model[]> {
    return this.prisma[this.model].findMany();
    // return { [this.model + 's']: await this.prisma[this.model].findMany() };
    // * {bookmarks: [...]} if we use format like this for response then we need to do it like the comment above
  }

  async findOne(id: number): Promise<Model> {
    const data = await this.prisma[this.model].findUnique({
      where: {
        id,
      },
    });

    if (!data)
      throw new NotFoundException(
        `No ${this.pluralModelName} found with this id`,
      );

    return data;
  }

  createOne(dto: CreateDTO): Promise<Model> {
    return this.prisma[this.model].create({
      data: dto,
    });
  }

  async updateOne(id: number, dto: UpdateDTO): Promise<Model> {
    try {
      const updatedData = await this.prisma[this.model].update({
        where: {
          id,
        },
        data: dto,
      });

      return updatedData;
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        if (err.code === 'P2025')
          throw new NotFoundException(
            `No ${this.pluralModelName} found with this id`,
          );
      }
    }
  }

  async deleteOne(id: number): Promise<null> {
    try {
      await this.prisma[this.model].delete({
        where: { id },
      });

      return null;
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        if (err.code === 'P2025')
          throw new NotFoundException(
            `No ${this.pluralModelName} found with this id`,
          );
      }
    }
  }
}
