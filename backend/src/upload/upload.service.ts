import { Injectable } from '@nestjs/common';
import { UploadRepository } from './upload.repository';
import { UploadResponseDto } from './dto';

@Injectable()
export class UploadService {
  constructor(private readonly uploadRepository: UploadRepository) {}

  async uploadFiles(
    userId: string,
    files: Express.Multer.File[],
  ): Promise<UploadResponseDto> {
    return this.uploadRepository.uploadFiles(userId, files);
  }
}
