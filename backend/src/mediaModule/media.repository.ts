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
import { FileMetadata, UserFilesEntity } from './entities';

@Injectable()
export class MediaRepository {
  private readonly fileTable = 'UserFiles';
  private readonly metadataTable = 'FileMetadata';
  constructor(
    private readonly dbService: DbService,
    private readonly s3Service: S3Service,
  ) {}

  // With @aws-sdk/lib-storage
  async uploadCompressedFilesv2(
    userId: string,
    files: Express.Multer.File[],
    body: UploadRequestDto,
  ): Promise<UploadResponseDto> {
    const timestamp = new Date().toISOString();
    const bucketName = `user-${userId}`;
    await this.bucketExists(bucketName);
    const folderName = `${body.email}/`;
    const fileKey = `${folderName}compressed-files-${timestamp}.zip`;
    await this.s3Service.uploadCompressedFiles(
      fileKey,
      files,
      body.storageClass,
    );
    try {
      const s3Url = `s3://${bucketName}/${fileKey}`;
      const uploadItem: UserFilesEntity = {
        userId,
        fileId: uuidv4(),
        key: fileKey,
        s3Url,
        email: body.email,
        storageClass: body.storageClass,
        uploadTimestamp: timestamp,
        fileType: 'application/zip',
      };

      const marshalledItem = marshall(uploadItem);
      await this.dbService.putItemCommand({
        TableName: this.fileTable,
        Item: marshalledItem,
      });

      console.log('ZIP file metadata saved to DynamoDB');

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { userId: _userId, fileId: _fileId, ...resItem } = uploadItem;

      return {
        message: 'Files compressed and saved successfully as a ZIP',
        files: [resItem],
      };
    } catch (error) {
      console.error('Error saving files', error);
      throw error;
    }
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

  async uploadMetadata(body: FileMetadata) {
    const response = await this.dbService.putItemCommand({
      TableName: this.metadataTable,
      Item: marshall(body),
    });
    if (response.$metadata.httpStatusCode === 200) {
      return {
        message: 'Metadata saved successfully',
      };
    }
  }
}
