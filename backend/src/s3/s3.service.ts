import {
  CreateBucketCommandInput,
  HeadBucketCommand,
  HeadBucketCommandInput,
  PutObjectCommand,
  PutObjectCommandInput,
  CreateBucketCommand,
  S3Client,
  StorageClass,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getEnv } from 'src/utils';

@Injectable()
export class S3Service {
  public readonly s3Client: S3Client;

  constructor(private readonly configService: ConfigService) {
    this.s3Client = new S3Client({
      region: getEnv(this.configService, 'AWS_REGION'),
      credentials: {
        accessKeyId: getEnv(this.configService, 'AWS_ACCESS_KEY_ID'),
        secretAccessKey: getEnv(this.configService, 'AWS_SECRET_ACCESS_KEY'),
      },
    });
  }

  async putObjectCommand(params: PutObjectCommandInput) {
    return this.s3Client.send(new PutObjectCommand(params));
  }

  async headBucketCommand(params: HeadBucketCommandInput) {
    return this.s3Client.send(new HeadBucketCommand(params));
  }

  async createBucketCommand(params: CreateBucketCommandInput) {
    return this.s3Client.send(new CreateBucketCommand(params));
  }

  async uploadLargeFile(
    bucketName: string,
    key: string,
    fileBuffer: Buffer,
    storageClass: StorageClass,
  ) {
    const PART_SIZE = 10 * 1024 * 1024; // 10MB per part
    const totalParts = Math.ceil(fileBuffer.length / PART_SIZE);
    console.log(`Starting Multipart Upload: ${totalParts} parts.`);

    const createUploadCommand = new CreateMultipartUploadCommand({
      Bucket: bucketName,
      Key: key,
      StorageClass: storageClass,
    });

    const { UploadId } = await this.s3Client.send(createUploadCommand);
    if (!UploadId) throw new Error('Failed to create multipart upload');
    let uploadedParts = 0;
    const uploadPromises: Promise<{
      PartNumber: number;
      ETag: string | undefined;
    }>[] = [];
    for (let index = 0; index < totalParts; index++) {
      const start = index * PART_SIZE;
      const end = Math.min(start + PART_SIZE, fileBuffer.length);
      const partBuffer = fileBuffer.slice(start, end);

      const uploadPartCommand = new UploadPartCommand({
        Bucket: bucketName,
        Key: key,
        PartNumber: index + 1,
        UploadId,
        Body: partBuffer,
      });

      const uploadPartPromise = this.s3Client
        .send(uploadPartCommand)
        .then((uploadPartResult) => {
          uploadedParts++;
          console.log(
            `Uploaded part ${index + 1}/${totalParts} - ${((uploadedParts / totalParts) * 100).toFixed(2)}% complete`,
          );
          return { PartNumber: index + 1, ETag: uploadPartResult.ETag };
        });

      uploadPromises.push(uploadPartPromise);
    }

    const parts = await Promise.all(uploadPromises);
    console.log(`Multipart Upload Complete for ${key}`);
    // Complete Multipart Upload
    const completeUploadCommand = new CompleteMultipartUploadCommand({
      Bucket: bucketName,
      Key: key,
      UploadId,
      MultipartUpload: { Parts: parts },
    });
    console.log(`Sending Multipart Upload for ${key}`);
    await this.s3Client.send(completeUploadCommand);
    console.log(`Multipart Upload Complete for ${key}`);
  }

  async generateSignedUrls<T extends { bucketName: string; key: string }>(
    data: T[],
  ): Promise<(T & { signedUrl: string })[]> {
    const signedUrlPromises = data.map(async (item) => {
      const signedUrl = await getSignedUrl(
        this.s3Client,
        new GetObjectCommand({
          Bucket: item.bucketName,
          Key: item.key,
        }),
        { expiresIn: 3600 },
      );

      return { ...item, signedUrl };
    });

    return Promise.all(signedUrlPromises);
  }
}
