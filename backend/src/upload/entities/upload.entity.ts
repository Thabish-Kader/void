import { StorageClass } from '@aws-sdk/client-s3';

export class Upload {
  userId: string;
  fileId: string;
  key: string;
  s3Url: string;
  storageClass?: StorageClass;
  uploadTimestamp: string;
  fileType: string;
}
