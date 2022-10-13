import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sharp from 'sharp';
import { S3 } from 'aws-sdk';
import { BufferFile } from '@senorg/common';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);

  constructor(private readonly configService: ConfigService) {}

  async uploadAvatar(directory: string, image: BufferFile): Promise<string> {
    const { buffer } = await image;
    const stream = await this.imageTransformer(Buffer.from(buffer));

    if (!stream) {
      this.logger.error(`Could not transform image`);
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

  async uploadImage(directory: string, filename: string, image: BufferFile): Promise<string> {
    const { buffer, mimetype } = await image;

    const key = `files/${directory}/${filename}`;

    const params = {
      Bucket: this.configService.get('AWS_STORAGE_BUCKET_NAME'),
      Key: key,
      Body: buffer,
      ContentType: mimetype,
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
  async imageTransformer(buffer: Buffer): Promise<Buffer | null> {
    try {
      return await sharp(buffer)
        .resize({
          width: 150,
          height: 150,
        })
        .webp()
        .toBuffer();
    } catch (err) {
      this.logger.error(err);
      return null;
    }
  }
}
