import {
  Controller,
  Post,
  Param,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  Get,
  Body,
  Query,
} from '@nestjs/common';
import { MediaService } from './media.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadRequestDto, UploadResponseDto } from './dto';
import { UserFilesEntity } from './entities';

@Controller('upload')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload-files/:userId')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadFiles(
    @Param('userId') userId: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: UploadRequestDto,
  ): Promise<UploadResponseDto> {
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one file is required.');
    }
    return this.mediaService.uploadFiles(userId, files, body);
  }

  @Get('get-files/:userId')
  async getFiles(@Param('userId') userId: string) {
    return this.mediaService.getFiles(userId);
  }

  @Get('get-archived-files/:userId')
  async getArchivedFiles(@Param('userId') userId: string) {
    return this.mediaService.getArchivedFiles(userId);
  }

  @Get('presigned-url')
  async getPresignedUrl(@Query() query: UploadRequestDto) {
    // const timestamp = new Date().toISOString();
    const folderName = `${query.email}/`;
    const fileKey = `${folderName}${query.fileName}`;
    return this.mediaService.getPresignedUrl(fileKey, query.storageClass);
  }

  @Post('update-metadata')
  async updateMetadata(@Body() body: UserFilesEntity) {
    return await this.mediaService.updateMetadata(body);
  }
}
