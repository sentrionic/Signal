import { BufferFile } from '../../common/types/buffer.file';

export const fileMock: BufferFile = {
  fieldname: 'name',
  originalname: 'avatar',
  encoding: 'utc-8',
  mimetype: 'image/*',
  size: 9999,
  buffer: Buffer.alloc(1),
};
