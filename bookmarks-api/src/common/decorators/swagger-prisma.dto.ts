import { ApiProperty } from '@nestjs/swagger';
import { Type } from '@nestjs/common';

// ! this decorator is not use

export function createSwaggerType<T>(type: Type<T>): Type<T> {
  const prototype = type.prototype;
  const properties = Reflect.ownKeys(prototype);

  properties.forEach((propertyKey) => {
    const metadata = Reflect.getMetadata('design:type', prototype, propertyKey);
    if (metadata) {
      ApiProperty({ type: metadata })(prototype, propertyKey);
    }
  });

  return type;
}
