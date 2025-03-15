export class Upload {
  userId: string;
  fileId: string;
  key: string;
  s3Url: string;
  storageClass?: 'GLACIER' | 'STANDARD' | 'S3' | 'DEEP_ARCHIVE';
  uploadTimestamp: string;
  fileType: 'VIDEO' | 'PHOTO' | 'AUDIO';
}
