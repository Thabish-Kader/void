import { IsString } from 'class-validator';
import { UserFilesEntity } from '../entities';

export class UploadFileDto {
  @IsString()
  filename: string;
}

export class UploadResponseDto {
  message: string;
  files: Omit<UserFilesEntity, 'userId' | 'fileId'>[];
}
