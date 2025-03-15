import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { UploadRepository } from './upload.repository';

@Module({
  controllers: [UploadController],
  providers: [UploadService, UploadRepository],
})
export class UploadModule {}
