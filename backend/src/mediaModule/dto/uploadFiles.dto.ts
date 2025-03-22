import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';
import { UserFilesEntity } from '../entities';
import { StorageClass } from '@aws-sdk/client-s3';

export class UploadRequestDto {
  @IsNotEmpty({ message: 'storageClass is required' })
  @IsEnum(StorageClass, {
    message: 'Storage class must be one of the valid S3 storage classes',
  })
  storageClass: StorageClass;

  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;
}

export class UploadResponseDto {
  message: string;
  files: Omit<UserFilesEntity, 'userId' | 'fileId'>[];
}
