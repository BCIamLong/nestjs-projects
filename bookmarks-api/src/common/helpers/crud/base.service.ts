import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { LIMIT, PAGE } from 'src/common/constants';
import { Pagination } from 'src/common/dto';
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

  findAll({
    limit,
    page,
    fields,
    sort,
    name,
    title,
  }: Pagination): Promise<Model[]> {
    // console.log(limit, page);
    const queryOb: Prisma.UserFindManyArgs = {
      orderBy: {
        createdAt: 'desc',
      },
      skip: PAGE * LIMIT - LIMIT,
      take: LIMIT,
    };

    // * search
    if (name || title) {
      let searchQueryOb = {};
      if (name) searchQueryOb = { name: { contains: name } };
      if (title) searchQueryOb = { title: { contains: title } };

      queryOb.where = searchQueryOb;
    }

    // * sort
    if (sort) {
      if (typeof sort === 'string') {
        let sortQueryOb = {};
        if (sort[0] === '-') sortQueryOb = { [sort.slice(1)]: 'desc' };
        else sortQueryOb = { [sort]: 'asc' };

        queryOb.orderBy = sortQueryOb;
      }
      if (Array.isArray(sort)) {
        const sortQueryArr = sort.map((val) =>
          val[0] === '-' ? { [val.slice(1)]: 'desc' } : { [val]: 'asc' },
        );

        queryOb.orderBy = sortQueryArr;
      }
    }

    // *fields
    if (fields) {
      const fieldsQueryOb = fields.split(',').reduce((ob, cur) => {
        return { ...ob, [cur]: true };
      }, {});

      queryOb.select = fieldsQueryOb;
    }

    // * paginate
    if (page && limit) {
      const skip = page * limit - limit;

      queryOb.skip = skip;
      queryOb.take = limit;
    }

    return this.prisma[this.model].findMany(queryOb);
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
