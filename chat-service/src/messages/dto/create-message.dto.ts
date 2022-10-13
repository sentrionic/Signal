import { ApiProperty } from '@nestjs/swagger';
import { BufferFile } from '../../common/types/buffer.file';

export class CreateMessageDto {
  @ApiProperty({
    type: String,
    required: false,
    description: 'The message. Either this or the file must not be null',
  })
  text?: string | null;

  @ApiProperty({ type: String, required: false, format: 'binary' })
  file?: BufferFile | null;
}
