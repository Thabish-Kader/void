import { IsString } from 'class-validator';
import { Upload } from '../entities';

export class UploadFileDto {
  @IsString()
  filename: string;
}

export class UploadResponseDto {
  message: string;
  files: Omit<Upload, 'userId' | 'fileId'>[];
}
