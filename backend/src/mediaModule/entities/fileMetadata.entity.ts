import { StorageClass } from '@aws-sdk/client-s3';

export class FileMetadata {
  email: string;
  fileId: string;
  fileName: string;
  uploadTimestamp: string;
  storageClass: StorageClass;
  fileSize?: number;
  s3Url: string;
  key: string;
}
