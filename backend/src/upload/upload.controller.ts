import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { UploadService } from './upload.service';
// import { CreateUploadDto } from './dto/create-upload.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadFileDto } from './dto';
import { Upload } from './entities';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  // @Post('single-file')
  // @UseInterceptors(FileInterceptor('file'))
  // uploadSingleFile(
  //   @UploadedFile() file: Express.Multer.File,
  //   @Body() createUploadDto: CreateUploadDto,
  // ) {
  //   return this.uploadService.uploadSingleFile(
  //     createUploadDto.userId,
  //     file.originalname,
  //     file.buffer,
  //   );
  // }
  @Post('single-file/:userId')
  @UseInterceptors(FileInterceptor('file'))
  async uploadSingleFile(
    @Param('userId') userId: string,
    @Body() fileDto: UploadFileDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Upload> {
    return this.uploadService.uploadSingleFile(userId, fileDto, file.buffer);
  }

  @Get()
  findAll() {
    return this.uploadService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.uploadService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.uploadService.remove(+id);
  }
}
