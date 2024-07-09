import { SetMetadata } from '@nestjs/common';
// * https://docs.google.com/document/d/1gAo_ZPdXQ_QswlC3H6mx3kd1HJwuImT92peI5ptW8dg/edit
export const SkipGlobalInterceptor = () =>
  SetMetadata('skipGlobalInterceptor', true);
