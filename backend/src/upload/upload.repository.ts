import { S3ServiceException, StorageClass } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { DbService } from 'src/db/db.service';
import { S3Service } from 'src/s3/s3.service';
import { v4 as uuidv4 } from 'uuid';
import { UploadResponseDto } from './dto';
import { Upload } from './entities';
import { marshall } from '@aws-sdk/util-dynamodb';

@Injectable()
export class UploadRepository {
  private readonly fileTable = 'UserFiles';
  constructor(
    private readonly dbService: DbService,
    private readonly s3Service: S3Service,
  ) {}

  async uploadFiles(
    userId: string,
    files: Express.Multer.File[],
  ): Promise<UploadResponseDto> {
    const bucketName = `user-${userId}`;
    const timestamp = new Date().toISOString();

    await this.bucketExists(bucketName);

    const uploadPromises = files.map(async (file, i) => {
      console.log(`${i} -> Uploading file ${file.originalname}`);
      const fileId = uuidv4();
      const key = `${file.originalname}`;
      const s3Url = `s3://${bucketName}/${key}`;
      const fileSizeMB = file.size / (1024 * 1024);

      let fileType: string;

      const mimeType = file.mimetype;

      if (mimeType.startsWith('image/')) {
        fileType = 'image';
      } else if (mimeType.startsWith('video/')) {
        fileType = 'video';
      } else {
        fileType = 'unknown';
      }

      try {
        if (fileSizeMB > 20) {
          console.log(
            `File ${file.originalname} is large (${fileSizeMB} MB). Using Multipart Upload.`,
          );
          await this.s3Service.uploadLargeFile(
            bucketName,
            key,
            file.buffer,
            StorageClass.STANDARD,
          );
        } else {
          await this.s3Service.putObjectCommand({
            Bucket: bucketName,
            Key: key,
            Body: file.buffer,
          });
        }
        console.log(`File ${file.originalname} uploaded to S3`);

        const uploadItem: Upload = {
          userId,
          fileId,
          key,
          s3Url,
          storageClass: StorageClass.STANDARD,
          uploadTimestamp: timestamp,
          fileType,
        };

        const marshalledItem = marshall(uploadItem);

        await this.dbService.putItemCommand({
          TableName: this.fileTable,
          Item: marshalledItem,
        });

        console.log(`File ${file.originalname} metadata saved to DynamoDB`);
        const {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          userId: _ommitUserId,
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          fileId: _ommitFileId,
          ...responseFile
        } = uploadItem;

        return responseFile;
      } catch (error) {
        console.error(`Error uploading file ${file.originalname}`, error);
        throw error;
      }
    });

    const responseFiles = await Promise.all(uploadPromises);

    const response: UploadResponseDto = {
      message: `${responseFiles.length} files uploaded successfully`,
      files: responseFiles,
    };

    return response;
  }

  async bucketExists(bucketName: string) {
    try {
      await this.s3Service.headBucketCommand({ Bucket: bucketName });
      console.log('Bucket Found');
    } catch (error: unknown) {
      if (
        error instanceof S3ServiceException &&
        error.$metadata.httpStatusCode === 404
      ) {
        await this.s3Service.createBucketCommand({ Bucket: bucketName });
        console.log('Bucket Created');
      } else {
        throw error;
      }
    }
  }
}
