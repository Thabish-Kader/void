import { S3ServiceException } from '@aws-sdk/client-s3';
import { Injectable, NotFoundException } from '@nestjs/common';
import { DbService } from 'src/db/db.service';
import { S3Service } from 'src/s3/s3.service';
import { v4 as uuidv4 } from 'uuid';
import {
  ArchivedFilesResponseDto,
  UploadRequestDto,
  UploadResponseDto,
  UserFileResponseDto,
} from './dto';

import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { UserFilesEntity } from './entities';

@Injectable()
export class MediaRepository {
  private readonly fileTable = 'UserFiles';
  constructor(
    private readonly dbService: DbService,
    private readonly s3Service: S3Service,
  ) {}

  async uploadFiles(
    userId: string,
    files: Express.Multer.File[],
    body: UploadRequestDto,
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
        const storageClass = body.storageClass;
        console.log(`Uploading to s3 ${storageClass}`);
        if (fileSizeMB > 20) {
          console.log(
            `File ${file.originalname} is large (${fileSizeMB} MB). Using Multipart Upload.`,
          );
          await this.s3Service.uploadLargeFile(
            bucketName,
            key,
            file.buffer,
            storageClass,
          );
        } else {
          await this.s3Service.putObjectCommand({
            Bucket: bucketName,
            Key: key,
            Body: file.buffer,
            StorageClass: storageClass,
          });
        }
        console.log(`File ${file.originalname} uploaded to S3`);

        const uploadItem: UserFilesEntity = {
          userId,
          fileId,
          key,
          s3Url,
          bucketName,
          storageClass: storageClass,
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

  async getFiles(userId: string): Promise<UserFileResponseDto[]> {
    const queryCommand = {
      TableName: this.fileTable,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': { S: userId },
      },
    };

    const result = await this.dbService.queryCommand(queryCommand);

    if (!result.Items || result.Items?.length === 0) {
      throw new NotFoundException('User Not Found');
    }
    const users: UserFilesEntity[] = result.Items.map(
      (item) => unmarshall(item) as UserFilesEntity,
    );

    const fileData =
      await this.s3Service.generateSignedUrls<UserFilesEntity>(users);

    const response: UserFileResponseDto[] = fileData.map((file) => {
      const data = {
        uploadedAt: file.uploadTimestamp,
        storageClass: file.storageClass,
        fileType: file.fileType,
        fileId: file.fileId,
        signedUrl: file.signedUrl,
      };
      return data;
    });

    return response;
  }

  async getArchivedFiles(userId: string): Promise<ArchivedFilesResponseDto[]> {
    const queryCommand = {
      TableName: this.fileTable,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': { S: userId },
      },
    };

    const result = await this.dbService.queryCommand(queryCommand);

    if (!result.Items || result.Items?.length === 0) {
      throw new NotFoundException('User Not Found');
    }
    const users: UserFilesEntity[] = result.Items.map(
      (item) => unmarshall(item) as UserFilesEntity,
    );

    const fileData =
      await this.s3Service.bulkRetrieveFiles<UserFilesEntity>(users);

    const response: ArchivedFilesResponseDto[] = fileData.map((file) => {
      const data = {
        uploadedAt: file.uploadTimestamp,
        storageClass: file.storageClass,
        fileType: file.fileType,
        fileId: file.fileId,
        signedUrl: file.signedUrl ?? '',
        restorStatus: file.restoreStatus,
      };
      return data;
    });

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
