import { ApiProperty } from '@nestjs/swagger';

export class FieldError {
  @ApiProperty({ type: String })
  field!: string;
  @ApiProperty({ type: String })
  message!: string;
}

export const formatErrors = (errors: FieldError[]) => {
  return { errors };
};
