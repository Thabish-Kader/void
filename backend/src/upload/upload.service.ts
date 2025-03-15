import { Injectable } from '@nestjs/common';
import { UploadRepository } from './upload.repository';
import { UploadFileDto } from './dto';
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

  findAll() {
    return `This action returns all upload`;
  }

  findOne(id: number) {
    return `This action returns a #${id} upload`;
  }

  remove(id: number) {
    return `This action removes a #${id} upload`;
  }
}
