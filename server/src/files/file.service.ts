import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BufferFile } from '../common/types/buffer.file';
import * as sharp from 'sharp';
import path from 'path';
import { S3 } from 'aws-sdk';

@Injectable()
export class FilesService {
  constructor(private readonly configService: ConfigService) {}

  async uploadAvatar(directory: string, image: BufferFile): Promise<string> {
    const { buffer } = await image;
    const stream = await this.imageTransformer(buffer);

    if (!stream) {
      throw new InternalServerErrorException();
    }

    const params = {
      Bucket: this.configService.get('AWS_STORAGE_BUCKET_NAME'),
      Key: `files/${directory}/avatar.webp`,
      Body: stream,
      ContentType: 'image/webp',
    };

    const s3 = new S3();

    const response = await s3.upload(params).promise();

    return response.Location;
  }

  async deleteFile(filename: string): Promise<void> {
    const index = filename.indexOf('files');
    const key = filename.slice(index);

    const params = {
      Bucket: this.configService.get('AWS_STORAGE_BUCKET_NAME'),
      Key: key,
    };

    const s3 = new S3();
    s3.deleteObject(params, (err) => {
      if (err) console.log(err, err.stack);
    });
  }

  /**
   * Shrinks the image to 150 x 150 and turns it into .webp
   * @param buffer
   */
  async imageTransformer(buffer: Buffer): Promise<Buffer> {
    return sharp(buffer)
      .resize({
        width: 150,
        height: 150,
      })
      .webp()
      .toBuffer();
  }

  formatName(filename: string): string {
    const file = path.parse(filename);
    const name = file.name;
    const ext = file.ext;
    const cleanFileName = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    return `${cleanFileName}${ext}`;
  }
}
