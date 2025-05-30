import {
  CreateBucketCommandInput,
  HeadBucketCommand,
  HeadBucketCommandInput,
  PutObjectCommand,
  PutObjectCommandInput,
  CreateBucketCommand,
  S3Client,
  StorageClass,
  GetObjectCommand,
  HeadObjectCommand,
  RestoreObjectCommand,
  ListObjectsV2CommandInput,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as archiver from 'archiver';

import { getEnv } from 'src/utils';
import { PassThrough } from 'stream';

@Injectable()
export class S3Service {
  public readonly s3Client: S3Client;
  private readonly bucketName: string;
  constructor(private readonly configService: ConfigService) {
    this.s3Client = new S3Client({
      region: getEnv(this.configService, 'AWS_REGION'),
      credentials: {
        accessKeyId: getEnv(this.configService, 'AWS_ACCESS_KEY_ID'),
        secretAccessKey: getEnv(this.configService, 'AWS_SECRET_ACCESS_KEY'),
      },
    });

    this.bucketName = getEnv(this.configService, 'AWS_BUCKET_NAME');
  }

  getBucketName() {
    return this.bucketName;
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

  async listObjectsV2Command(params: ListObjectsV2CommandInput) {
    return this.s3Client.send(new ListObjectsV2Command(params));
  }

  async uploadCompressedFiles(
    folderKey: string,
    files: Express.Multer.File[],
    storageClass: StorageClass,
  ) {
    try {
      const archiveStream = new PassThrough(); // Streaming ZIP archive
      const archive = archiver('zip', { zlib: { level: 9 } });
      const filesKey: string[] = [];
      let totalFileSize = 0;
      const imageFiles: Express.Multer.File[] = [];
      const otherFiles: Express.Multer.File[] = [];

      for (const file of files) {
        if (!file || !file.buffer || file.buffer.length === 0) {
          console.error(`Skipping empty file: ${file.originalname}`);
          continue;
        }

        if (file.mimetype.startsWith('image/')) {
          imageFiles.push(file);
        } else {
          otherFiles.push(file);
        }
      }

      for (const file of otherFiles) {
        const fileKey = `${folderKey}-${file.originalname}`;
        console.log(
          `Uploading non-image file: ${file.originalname}, Size: ${(file.size / 1024 / 1024).toFixed(2)} MB`,
        );

        const upload = new Upload({
          client: this.s3Client,
          params: {
            Bucket: this.bucketName,
            Key: fileKey,
            Body: file.buffer,
            ContentType: file.mimetype,
            StorageClass: storageClass,
          },
        });

        upload.on('httpUploadProgress', (progress) => {
          const uploadedMB = progress.loaded
            ? (progress.loaded / 1024 / 1024).toFixed(2)
            : 'Error occurred';
          const totalMB = progress.total
            ? (progress.total / 1024 / 1024).toFixed(2)
            : 'Unknown';
          console.log(`📤 Upload Progress: ${uploadedMB} MB / ${totalMB} MB`);
        });

        await upload.done();
        console.log(`✅ Uploaded: ${fileKey}`);
        totalFileSize += file.size;
        filesKey.push(fileKey);
      }

      if (imageFiles.length > 0) {
        const imagesKey = `${folderKey}-images.zip`;
        console.log(`Compressing ${imageFiles.length} images into a ZIP...`);
        filesKey.push(imagesKey);
        const s3UploadParams = {
          Bucket: this.bucketName,
          Key: imagesKey,
          Body: archiveStream,
          ContentType: 'application/zip',
          StorageClass: storageClass,
        };

        const upload = new Upload({
          client: this.s3Client,
          params: s3UploadParams,
        });

        archive.on('error', (err) => {
          console.error('Archiver Error:', err);
          archiveStream.destroy(err);
        });

        archiveStream.on('error', (err) => {
          console.error('Stream Error:', err);
        });

        archive.pipe(archiveStream);

        for (const file of imageFiles) {
          if (!file || !file.buffer || file.buffer.length === 0) {
            console.error(`Skipping empty file: ${file.originalname}`);
            continue;
          }
          console.log(
            `Adding file: ${file.originalname}, Size: ${(file.size / 1024 / 1024).toFixed(2)} MB`,
          );
          archive.append(file.buffer, { name: file.originalname });
          totalFileSize += file.size;
        }
        // Finalizing the archive before upload completes
        await archive.finalize().then(() => {
          console.log('Archive finalization complete');
        });

        await upload.done();
        console.log(`✅ Uploaded: ${folderKey}-images.zip`);
      }
      return { filesKey, totalFileSize };
    } catch (error) {
      console.error('Error uploading compressed files:', error);
      throw error;
    }
  }

  async generateSignedUrlForUpload(
    fileKey: string,
    storageClass: StorageClass,
  ) {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey,
      StorageClass: storageClass,
    });

    const signedUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: 3600,
    });

    return { signedUrl, fileKey };
  }

  async generateSignedUrls<T extends { key: string; email: string }>(
    data: T[],
  ): Promise<(T & { signedUrl: string })[]> {
    const signedUrlPromises = data.map(async (item) => {
      const signedUrl = await getSignedUrl(
        this.s3Client,
        new GetObjectCommand({
          Bucket: getEnv(this.configService, 'AWS_BUCKET_NAME'),
          Key: `${item.email}/${item.key}`,
        }),
        { expiresIn: 3600 },
      );

      return { ...item, signedUrl };
    });

    return Promise.all(signedUrlPromises);
  }

  async bulkRetrieveFiles<T extends { key: string }>(
    data: T[],
  ): Promise<(T & { signedUrl?: string; restoreStatus?: string })[]> {
    const fileStatus = {
      AVAILABLE: 'AVAILABLE',
      RESTORING: 'RESTORING IN PROGRESS',
      ERROR: 'ERROR',
    };
    console.log({ data });
    const restorePromises = data.map(async (item) => {
      try {
        // Step 1: Check if the object is already restored
        const headObject = await this.s3Client.send(
          new HeadObjectCommand({
            Bucket: this.bucketName,
            Key: item.key,
          }),
        );

        const storageClass = headObject.StorageClass;
        const restoreStatus = headObject.Restore;
        console.log({ storageClass, restoreStatus });
        // Step 2: If file is in Glacier or Deep Archive and not restored, send restore request
        if (
          storageClass?.includes('GLACIER') ||
          storageClass?.includes('DEEP_ARCHIVE')
        ) {
          if (
            restoreStatus &&
            restoreStatus?.includes('ongoing-request="true"')
          ) {
            return { ...item, restoreStatus: fileStatus.RESTORING };
          } else if (
            !restoreStatus ||
            !restoreStatus.includes('ongoing-request="false"')
          ) {
            await this.s3Client.send(
              new RestoreObjectCommand({
                Bucket: this.bucketName,
                Key: item.key,
                RestoreRequest: {
                  Days: 7, // Keep restored files for 7 days
                  GlacierJobParameters: {
                    Tier: storageClass.includes('DEEP_ARCHIVE')
                      ? 'Standard'
                      : 'Bulk',
                  },
                },
              }),
            );
            return { ...item, restoreStatus: fileStatus.RESTORING };
          }
        }
        // Step 3: If file is already restored, generate a signed URL
        const signedUrl = await getSignedUrl(
          this.s3Client,
          new GetObjectCommand({
            Bucket: this.bucketName,
            Key: item.key,
          }),
          { expiresIn: 3600 },
        );

        return { ...item, signedUrl, restoreStatus: fileStatus.AVAILABLE };
      } catch (error) {
        console.error(`Error processing file ${item.key}:`, error);

        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error occurred';

        return {
          ...item,
          restoreStatus: `${fileStatus.ERROR}: ${errorMessage}`,
        };
      }
    });

    return Promise.all(restorePromises);
  }
}
