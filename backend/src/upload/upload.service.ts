import { Injectable } from '@nestjs/common';
import { UploadRepository } from './upload.repository';
import { UploadFileDto, UploadResponseDto } from './dto';
import { Upload } from './entities';

@Injectable()
export class UploadService {
  constructor(private readonly uploadRepository: UploadRepository) {}

  async uploadSingleFile(
    userId: string,
    fileDto: UploadFileDto,
    file: Buffer,
  ): Promise<Upload> {
    return this.uploadRepository.uploadSingleFile(userId, fileDto, file);
  }

  async uploadMultipleFiles(
    userId: string,
    fileDto: UploadFileDto,
    files: Express.Multer.File[],
  ): Promise<UploadResponseDto> {
    return this.uploadRepository.uploadMultipleFiles(userId, fileDto, files);
  }
}
