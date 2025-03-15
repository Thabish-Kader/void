import { S3ServiceException } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { DbService } from 'src/db/db.service';
import { S3Service } from 'src/s3/s3.service';
import { v4 as uuidv4 } from 'uuid';
import { UploadFileDto } from './dto';
import { Upload } from './entities';
import { marshall } from '@aws-sdk/util-dynamodb';

@Injectable()
export class UploadRepository {
  private readonly fileTable = 'UserFiles';
  constructor(
    private readonly dbService: DbService,
    private readonly s3Service: S3Service,
  ) {}

  async uploadSingleFile(
    userId: string,
    fileDto: UploadFileDto,
    file: Buffer,
  ): Promise<Upload> {
    const bucketName = `user-${userId}`;
    const fileId = uuidv4();
    const key = `${fileId}/${fileDto.filename}`;
    const s3Url = `s3://${bucketName}/${key}`;
    const timestamp = new Date().toISOString();

    try {
      await this.bucketExists(bucketName);
      await this.s3Service.putObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: file,
      });
      console.log('Item Created');

      const uploadItem: Upload = {
        userId,
        fileId,
        key,
        s3Url,
        storageClass: 'GLACIER',
        uploadTimestamp: timestamp,
        fileType: fileDto.fileType,
      };

      const marshalledItem = marshall(uploadItem);

      await this.dbService.putItemCommand({
        TableName: this.fileTable,
        Item: marshalledItem,
      });

      console.log('Item Uploaded to Dynamo');

      return uploadItem;
    } catch (error) {
      console.error(error);
      throw error;
    }
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
