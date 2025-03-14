import { Injectable } from '@nestjs/common';
// import { CreateUploadDto } from './dto/create-upload.dto';
import { UpdateUploadDto } from './dto/update-upload.dto';
import { S3Service } from 'src/s3/s3.service';
import {
  CreateBucketCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
  S3ServiceException,
} from '@aws-sdk/client-s3';

@Injectable()
export class UploadService {
  private readonly s3client: S3Client;

  constructor(private readonly s3Service: S3Service) {
    this.s3client = s3Service.getS3Client();
  }

  async uploadSingleFile(userId: string, filename: string, file: Buffer) {
    const bucketName = `user-${userId}`;

    try {
      await this.bucketExists(bucketName);

      const key = `${userId}/${filename}`;

      await this.s3client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: key,
          Body: file,
        }),
      );

      return 'Upload Successful';
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  findAll() {
    return `This action returns all upload`;
  }

  findOne(id: number) {
    return `This action returns a #${id} upload`;
  }

  update(id: number, updateUploadDto: UpdateUploadDto) {
    return `This action updates a #${id} upload`;
  }

  remove(id: number) {
    return `This action removes a #${id} upload`;
  }

  async bucketExists(bucketName: string) {
    try {
      await this.s3client.send(new HeadBucketCommand({ Bucket: bucketName }));
    } catch (error: unknown) {
      if (
        error instanceof S3ServiceException &&
        error.$metadata.httpStatusCode === 404
      ) {
        await this.s3client.send(
          new CreateBucketCommand({
            Bucket: bucketName,
          }),
        );
      } else {
        throw error;
      }
    }
  }
}
