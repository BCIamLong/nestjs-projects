import { ArgumentMetadata, PipeTransform } from '@nestjs/common';

export class TransformImage implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    // * https://github.com/rubiin/ultimate-nest/blob/master/src/common/pipes/sharp.pipe.ts
    // * read this as reference
    return value;
  }
}
