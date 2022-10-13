import { BufferFile } from '../../types/buffer.file';

export class AvatarUploadedEvent {
  constructor(public readonly image: BufferFile, public readonly directory: string) {}

  toString() {
    return JSON.stringify({
      image: this.image,
      directory: this.directory,
    });
  }
}
