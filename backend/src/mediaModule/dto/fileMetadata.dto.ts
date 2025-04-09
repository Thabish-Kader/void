import { StorageClass } from '@aws-sdk/client-s3';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

export class FileMetadataDto {
  @IsEmail()
  email: string;
  @IsNotEmpty()
  fileId: string;

  @IsNotEmpty()
  fileName: string;

  @IsNotEmpty()
  uploadTimestamp: string;
  @IsEnum(StorageClass, {
    message: 'Storage class must be one of the valid S3 storage classes',
  })
  storageClass: StorageClass;

  @IsNotEmpty()
  s3Url: string;
  @IsOptional()
  fileSize?: number;
  @IsNotEmpty()
  key: string;
}
