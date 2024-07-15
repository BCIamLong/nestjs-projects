import { Transform, Type } from 'class-transformer';
import {
  // IsArray,
  // IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

class Search {
  @IsOptional()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  name: string;
}

export class Pagination extends Search {
  // paginate: ?page=1&limit=3 => {page: 1, limit: 3}
  @IsOptional()
  @IsPositive()
  @IsInt()
  @Type(() => Number)
  limit: number;

  @IsOptional()
  @IsPositive()
  @IsInt()
  @Type(() => Number)
  page: number;

  // sort: ?sort=name => {sort: 'name'}, ?sort=name&sort=age => {sort: ['name', 'age']}
  @IsOptional()
  @Transform(
    ({ value }) =>
      typeof value === 'string'
        ? value
        : value.map((val: any) => val.toString()),
    // { toClassOnly: true },
  )
  sort: string | string[];

  // fields: ?fields='name,age,phone' => {fields: 'name,age,phone'}
  @IsOptional()
  @IsString()
  fields: string;

  // age[gt]=2 => {age: { gt: '2' }}, gt, lt, gte, lte
}
