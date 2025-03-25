import { StorageClass } from '@aws-sdk/client-s3';

export class UserFilesEntity {
  userId: string;
  fileId: string;
  key: string;
  s3Url: string;
  storageClass: StorageClass;
  uploadTimestamp: string;
  fileType: string;
  email: string;
}
