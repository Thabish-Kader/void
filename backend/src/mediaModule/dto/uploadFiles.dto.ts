import { IsEmail, IsEnum, IsOptional } from 'class-validator';
import { FileMetadata } from '../entities';
import { StorageClass } from '@aws-sdk/client-s3';

export class UploadRequestDto {
  @IsEnum(StorageClass, {
    message: 'Storage class must be one of the valid S3 storage classes',
  })
  storageClass: StorageClass;

  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsOptional()
  fileName: string;
}

export class UploadResponseDto {
  message: string;
  files: any[];
}
