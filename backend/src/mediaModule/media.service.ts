import { Injectable } from '@nestjs/common';
import { MediaRepository } from './media.repository';
import {
  ArchivedFilesResponseDto,
  UploadRequestDto,
  UserFileResponseDto,
} from './dto';
import { S3Service } from 'src/s3/s3.service';
import { StorageClass } from '@aws-sdk/client-s3';
import { FileMetadata } from './entities';

@Injectable()
export class MediaService {
  constructor(
    private readonly mediaRepository: MediaRepository,
    private readonly s3Service: S3Service,
  ) {}

  async uploadFiles(files: Express.Multer.File[], body: UploadRequestDto) {
    const response = await this.mediaRepository.uploadCompressedFilesv2(
      files,
      body,
    );
    return response;
  }

  async getFiles(userId: string): Promise<UserFileResponseDto[]> {
    const response = await this.mediaRepository.getFiles(userId);
    return response;
  }

  async getArchivedFiles(email: string): Promise<ArchivedFilesResponseDto[]> {
    const response = await this.mediaRepository.getArchivedFiles(email);
    return response;
  }

  async getPresignedUrl(fileKey: string, storageClass: StorageClass) {
    const response = await this.s3Service.generateSignedUrlForUpload(
      fileKey,
      storageClass,
    );
    return response;
  }

  async uploadMetadata(body: FileMetadata) {
    const response = await this.mediaRepository.uploadMetadata(body);
    return response;
  }

  async getListOfFiles(folderName: string) {
    const response = await this.mediaRepository.getListOfFiles(folderName);
    return response;
  }
}
