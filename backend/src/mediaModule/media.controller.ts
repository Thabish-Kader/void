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
import { FileMetadataDto, UploadRequestDto } from './dto';

@Controller('upload')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload-files')
  @UseInterceptors(
    FilesInterceptor('files', 100, {
      limits: { fileSize: 1 * 1024 * 1024 * 1024 },
    }),
  )
  async uploadFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: UploadRequestDto,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one file is required.');
    }
    return this.mediaService.uploadFiles(files, body);
  }

  @Get('get-files/:userId')
  async getFiles(@Param('userId') userId: string) {
    return this.mediaService.getFiles(userId);
  }

  @Get('get-archived-files/:email')
  async getArchivedFiles(@Param('email') email: string) {
    return this.mediaService.getArchivedFiles(email);
  }

  @Get('presigned-url')
  async getPresignedUrl(@Query() query: UploadRequestDto) {
    // const timestamp = new Date().toISOString();
    const folderName = `${query.email}/`;
    const fileKey = `${folderName}${query.fileName}`;
    return this.mediaService.getPresignedUrl(fileKey, query.storageClass);
  }

  @Post('upload-metadata')
  async uploadMetadata(@Body() body: FileMetadataDto) {
    return await this.mediaService.uploadMetadata(body);
  }

  @Get('list-of-files')
  async getListOfFiles(@Query('email') folderName: string) {
    return await this.mediaService.getListOfFiles(folderName);
  }
}
