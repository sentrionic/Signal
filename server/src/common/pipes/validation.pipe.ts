import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { FieldError } from '../dto/error.response';
import { ValidationError } from 'yup';

@Injectable()
export class YupValidationPipe implements PipeTransform {
  constructor(private readonly schema: any) {}

  async transform(value: any, _: ArgumentMetadata) {
    try {
      await this.schema.validate(value, { abortEarly: false });
    } catch (err) {
      if (err instanceof ValidationError) {
        const errors: FieldError[] = [];

        err.inner.map((value: ValidationError) => {
          const message = value.errors[0];
          errors.push({
            field: value.path ?? 'Unknown Field',
            message: `${message[0].toUpperCase()}${message.slice(1)}`,
          });
        });

        throw new BadRequestException({
          message: 'Input data validation failed',
          errors,
        });
      }
    }

    return value;
  }
}
