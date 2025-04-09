import { S3ServiceException } from '@aws-sdk/client-s3';
import { Injectable, NotFoundException } from '@nestjs/common';
import { DbService } from 'src/db/db.service';
import { S3Service } from 'src/s3/s3.service';
import { v4 as uuidv4 } from 'uuid';
import {
  ArchivedFilesResponseDto,
  UploadRequestDto,
  UserFileResponseDto,
} from './dto';

import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { FileMetadata, UserFilesEntity } from './entities';

@Injectable()
export class MediaRepository {
  private readonly fileTable = 'UserFiles';
  private readonly metadataTable = 'FileMetadata';
  private readonly bucketName: string;
  constructor(
    private readonly dbService: DbService,
    private readonly s3Service: S3Service,
  ) {
    this.bucketName = this.s3Service.getBucketName();
  }

  // With @aws-sdk/lib-storage
  async uploadCompressedFilesv2(
    files: Express.Multer.File[],
    body: UploadRequestDto,
  ) {
    const timestamp = new Date().toISOString();

    const folderName = `${body.email}/`;
    const fileName = `files-${timestamp}`;
    const fileKey = `${folderName}${fileName}`;
    const result = await this.s3Service.uploadCompressedFiles(
      fileKey,
      files,
      body.storageClass,
    );
    try {
      for (const file of result.filesKey) {
        const s3Url = `s3://${this.bucketName}/${file}`;
        const uploadItem: FileMetadata = {
          fileId: uuidv4(),
          email: body.email,
          storageClass: body.storageClass,
          uploadTimestamp: timestamp,
          fileName: fileName,
          fileSize: result.totalFileSize,
          s3Url,
          key: file,
        };

        const marshalledItem = marshall(uploadItem);
        await this.dbService.putItemCommand({
          TableName: this.metadataTable,
          Item: marshalledItem,
        });

        console.log('ZIP file metadata saved to DynamoDB');
      }
      return {
        message: 'Files compressed and saved successfully as a ZIP',
        files: result,
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

  async getArchivedFiles(email: string): Promise<ArchivedFilesResponseDto[]> {
    const queryCommand = {
      TableName: this.metadataTable,
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': { S: email },
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

  async getListOfFiles(folderName: string) {
    const command = {
      Bucket: this.bucketName,
      Prefix: folderName,
    };
    try {
      const response = await this.s3Service.listObjectsV2Command(command);
      console.log(response);
      const files = response.Contents?.map((item) => {
        const fileName = item.Key?.replace(folderName + '/', '');
        return fileName;
      });
      return files;
    } catch (error) {
      console.error('Error listing files:', error);
      throw error;
    }
  }
}
