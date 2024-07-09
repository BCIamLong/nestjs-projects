import { SetMetadata } from '@nestjs/common';

export const SkipGlobalInterceptor = () =>
  SetMetadata('skipGlobalInterceptor', true);
