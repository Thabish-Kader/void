import {
  Controller,
  Post,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { UploadService } from './upload.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UploadFileDto, UploadResponseDto } from './dto';
import { Upload } from './entities';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('single-file/:userId')
  @UseInterceptors(FileInterceptor('file'))
  async uploadSingleFile(
    @Param('userId') userId: string,
    @Body() fileDto: UploadFileDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Upload> {
    if (!file) {
      throw new BadRequestException('At least one file is required.');
    }
    return this.uploadService.uploadSingleFile(userId, fileDto, file.buffer);
  }

  @Post('multiples-files/:userId')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadMultipleFiles(
    @Param('userId') userId: string,
    @Body() fileDto: UploadFileDto,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<UploadResponseDto> {
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one file is required.');
    }
    return this.uploadService.uploadMultipleFiles(userId, fileDto, files);
  }
}
