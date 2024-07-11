// * https://docs.nestjs.com/pipes
// * so pipe has two features: 1 is transformation so basically we want to transformer some properties to another type
// * for example: i want convert string to number, number to string, string to date, number to boolean...
// * 2 is validation to validate the input fields so kind of validate with schema in express app with Joi right

// * pipes use with validation is the most use cases, but transformation is also very useful

export * from './parse-int.pipe';
export * from './transform-image.pipe';
