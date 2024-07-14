import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  getSchemaPath,
} from '@nestjs/swagger';

export function ApiResult(
  dto: Type,
  modelName: string,
  operation: 'getAll' | 'getOne' | 'create' | 'update' | 'delete',
) {
  const resOb = {
    schema: {
      properties: {
        status: {
          type: 'string',
        },
        data: {
          $ref: getSchemaPath(dto),
        },
      },
    },
    // type: dto,
  };

  if (operation === 'getAll')
    return applyDecorators(
      ApiOperation({ summary: `get a list of ${modelName}s` }),
      // * if we want to use other model, schema doesn't have in our schemas yet like if we use CreateDTP in the body of route handler it will automatically added
      // * but with something doesn't added we can use ApiExtraModels to add schemas, models to use because if we don't do that then it can become an error
      ApiExtraModels(dto),
      ApiOkResponse({
        description: 'Ok',
        schema: {
          properties: {
            status: {
              type: 'string',
            },
            data: { type: 'array', items: { $ref: getSchemaPath(dto) } },
          },
        },
      }),
      ApiInternalServerErrorResponse({ description: 'Something went wrong' }),
    );

  if (operation === 'getOne')
    return applyDecorators(
      ApiOperation({ summary: `get a specific ${modelName}` }),
      ApiOkResponse({ description: 'Ok', ...resOb }),
      ApiNotFoundResponse({ description: 'Not found' }),
      ApiInternalServerErrorResponse({ description: 'Something went wrong' }),
    );

  if (operation === 'create')
    return applyDecorators(
      ApiOperation({ summary: `create a ${modelName}` }),
      ApiCreatedResponse({ description: 'New data created', ...resOb }),
      ApiBadRequestResponse({ description: 'Bad Request' }),
      ApiInternalServerErrorResponse({ description: 'Something went wrong' }),
    );

  if (operation === 'update')
    return applyDecorators(
      ApiOperation({ summary: `update a ${modelName} with a specific id` }),
      ApiOkResponse({ description: 'The data is updated', ...resOb }),
      ApiBadRequestResponse({ description: 'Bad Request' }),
      ApiInternalServerErrorResponse({ description: 'Something went wrong' }),
    );

  if (operation === 'delete')
    return applyDecorators(
      ApiOperation({ summary: `delete a specific ${modelName}` }),
      ApiNoContentResponse({
        description: 'The data is deleted',
        schema: {
          properties: {
            status: {
              type: 'string',
            },
            data: {
              type: 'null',
            },
          },
        },
      }),
      ApiNotFoundResponse({ description: 'Not found' }),
      ApiInternalServerErrorResponse({ description: 'Something went wrong' }),
    );
}
