import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { ObjectSchema, ValidationErrorItem } from 'joi';
import { FieldError } from '../dto/error.response';

@Injectable()
export class JoiValidationPipe implements PipeTransform {
  constructor(private schema: ObjectSchema) {}

  transform(value: any, _: ArgumentMetadata) {
    const { error } = this.schema.validate(value, { abortEarly: false });
    if (error) {
      const errors: FieldError[] = [];

      error.details.map((value: ValidationErrorItem) => {
        const message = value.message.replaceAll('"', '');
        errors.push({
          field: value.path[0].toString(),
          message: `${message[0].toUpperCase()}${message.slice(1)}`,
        });
      });

      throw new BadRequestException({
        message: 'Input data validation failed',
        errors,
      });
    }
    return value;
  }
}
