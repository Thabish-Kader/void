import { Injectable } from '@nestjs/common';
import { MediaRepository } from './media.repository';
import { UploadResponseDto, UserFileResponseDto } from './dto';

@Injectable()
export class MediaService {
  constructor(private readonly mediaRepository: MediaRepository) {}

  async uploadFiles(
    userId: string,
    files: Express.Multer.File[],
  ): Promise<UploadResponseDto> {
    const response = await this.mediaRepository.uploadFiles(userId, files);
    return response;
  }

  async getFiles(userId: string): Promise<UserFileResponseDto[]> {
    const response = await this.mediaRepository.getFiles(userId);
    return response;
  }
}
