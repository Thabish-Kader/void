import { Injectable } from '@nestjs/common';
import { UploadRepository } from './upload.repository';
import { UploadResponseDto, UserFileResponseDto } from './dto';

@Injectable()
export class UploadService {
  constructor(private readonly uploadRepository: UploadRepository) {}

  async uploadFiles(
    userId: string,
    files: Express.Multer.File[],
  ): Promise<UploadResponseDto> {
    const response = await this.uploadRepository.uploadFiles(userId, files);
    return response;
  }

  async getFiles(userId: string): Promise<UserFileResponseDto[]> {
    const response = await this.uploadRepository.getFiles(userId);
    return response;
  }
}
