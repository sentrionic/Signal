import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import {
  AvatarUploadedEvent,
  FileDeletedEvent,
  ImageUploadedEvent,
  Subjects,
} from '@senorg/common';
import { FilesService } from './files.service';

@Controller()
export class AppController {
  constructor(private readonly filesService: FilesService) {}

  @MessagePattern(Subjects.MediaAvatarUploaded)
  async handleAvatarUpload(@Payload() { image, directory }: AvatarUploadedEvent): Promise<string> {
    return await this.filesService.uploadAvatar(directory, image);
  }

  @MessagePattern(Subjects.MediaImageUploaded)
  async handleMessageFileUpload(
    @Payload() { image, filename, directory }: ImageUploadedEvent,
  ): Promise<string> {
    return await this.filesService.uploadImage(directory, filename, image);
  }

  @EventPattern(Subjects.MediaFileDeleted)
  async handleMessageDeleteFile(@Payload() { filename }: FileDeletedEvent): Promise<void> {
    await this.filesService.deleteFile(filename);
  }
}
