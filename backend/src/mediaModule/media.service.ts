import { Injectable } from '@nestjs/common';
import { MediaRepository } from './media.repository';
import {
  ArchivedFilesResponseDto,
  UploadRequestDto,
  UploadResponseDto,
  UserFileResponseDto,
} from './dto';

@Injectable()
export class MediaService {
  constructor(private readonly mediaRepository: MediaRepository) {}

  async uploadFiles(
    userId: string,
    files: Express.Multer.File[],
    body: UploadRequestDto,
  ): Promise<UploadResponseDto> {
    const response = await this.mediaRepository.uploadCompressedFilesv2(
      userId,
      files,
      body,
    );
    return response;
  }

  async getFiles(userId: string): Promise<UserFileResponseDto[]> {
    const response = await this.mediaRepository.getFiles(userId);
    return response;
  }

  async getArchivedFiles(userId: string): Promise<ArchivedFilesResponseDto[]> {
    const response = await this.mediaRepository.getArchivedFiles(userId);
    return response;
  }
}
