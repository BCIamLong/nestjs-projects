import { Prisma } from '@prisma/client';
import { LIMIT, PAGE } from '../constants';
import { Pagination } from '../dto';

export async function paginate<Model>(
  model: Prisma.UserDelegate,
  { limit, page, fields, sort, name, title }: Pagination,
) {
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
  const result = await model.findMany(queryOb);

  return result as Model[];
  // return { [this.model + 's']: await this.prisma[this.model].findMany() };
  // * {bookmarks: [...]} if we use format like this for response then we need to do it like the comment above
}
