import { IsEnum, IsString } from 'class-validator';

export class UploadFileDto {
  @IsString()
  filename: string;

  @IsEnum(['VIDEO', 'PHOTO', 'AUDIO'], {
    message: 'File Type must be one of the following : VIDEO, PHOTO or AUDIO',
  })
  fileType: 'VIDEO' | 'PHOTO' | 'AUDIO';
}
