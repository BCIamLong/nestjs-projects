import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

// * pipes are just validate input data like request body like we validate inputs in express app with schema with Joi
// * and pipes also can be used to transform the data from the input to something like we can post the image to create the user avatar then we need to transform to the image name and also store this to the cloud, disk or other bucket data right

// * https://github.com/stuyy/nestjs-crash-course/blob/master/src/users/pipes/validate-create-user.pipe.ts
// * we can reference at this
@Injectable()
export class ParseIntPipeCustom implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    const val = parseInt(value);
    if (isNaN(val)) throw new BadRequestException('The value must be number');

    return val;
  }
}
