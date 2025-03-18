import {
  Controller,
  Post,
  Param,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  Get,
} from '@nestjs/common';
import { MediaService } from './media.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadResponseDto } from './dto';

@Controller('upload')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload-files/:userId')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadFiles(
    @Param('userId') userId: string,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<UploadResponseDto> {
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one file is required.');
    }
    return this.mediaService.uploadFiles(userId, files);
  }

  @Get('get-files/:userId')
  async getFiles(@Param('userId') userId: string) {
    return this.mediaService.getFiles(userId);
  }
}
