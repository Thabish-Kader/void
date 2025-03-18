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

export class UserFileResponseDto {
  uploadedAt: string;
  storageClass: string;
  fileType: string;
  fileId: string;
  signedUrl: string;
}
