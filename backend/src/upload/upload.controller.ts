import {
  Controller,
  Post,
  Param,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  Get,
} from '@nestjs/common';
import { UploadService } from './upload.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadResponseDto } from './dto';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('upload-files/:userId')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadFiles(
    @Param('userId') userId: string,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<UploadResponseDto> {
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one file is required.');
    }
    return this.uploadService.uploadFiles(userId, files);
  }

  @Get('get-files/:userId')
  async getFiles(@Param('userId') userId: string) {
    return this.uploadService.getFiles(userId);
  }
}
