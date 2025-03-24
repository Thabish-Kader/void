import { Injectable } from '@nestjs/common';
import { MediaRepository } from './media.repository';
import {
  ArchivedFilesResponseDto,
  UploadRequestDto,
  UploadResponseDto,
  UserFileResponseDto,
} from './dto';
import { S3Service } from 'src/s3/s3.service';
import { StorageClass } from '@aws-sdk/client-s3';
import { UserFilesEntity } from './entities';

@Injectable()
export class MediaService {
  constructor(
    private readonly mediaRepository: MediaRepository,
    private readonly s3Service: S3Service,
  ) {}

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

  async getPresignedUrl(fileKey: string, storageClass: StorageClass) {
    const response = await this.s3Service.generateSignedUrlForUpload(
      fileKey,
      storageClass,
    );
    return response;
  }

  async updateMetadata(body: UserFilesEntity) {
    const response = await this.mediaRepository.updateMetadata(body);
    return response;
  }
}
