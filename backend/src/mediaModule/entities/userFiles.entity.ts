import { StorageClass } from '@aws-sdk/client-s3';

export class UserFilesEntity {
  userId: string;
  fileId: string;
  key: string;
  bucketName: string;
  s3Url: string;
  storageClass: StorageClass;
  uploadTimestamp: string;
  fileType: string;
  email: string;
}
