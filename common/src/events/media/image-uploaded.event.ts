import { BufferFile } from '../../types/buffer.file';

export class ImageUploadedEvent {
  constructor(
    public readonly image: BufferFile,
    public readonly filename: string,
    public readonly directory: string,
  ) {}

  toString() {
    return JSON.stringify({
      image: this.image,
      filename: this.filename,
      directory: this.directory,
    });
  }
}
