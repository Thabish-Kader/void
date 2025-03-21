import {
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  S3ServiceException,
  UploadPartCommand,
} from '@aws-sdk/client-s3';
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
import { Upload } from '@aws-sdk/lib-storage';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { UserFilesEntity } from './entities';
import * as archiver from 'archiver';
import * as fs from 'fs';
import * as path from 'path';
import * as tmp from 'tmp';
import * as stream from 'stream';
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

      const fileType = file.mimetype;

      try {
        const storageClass = body.storageClass;
        console.log(`Uploading to s3 ${storageClass}`);
        console.log(
          `File ${file.originalname} is large (${fileSizeMB} MB). Using Multipart Upload.`,
        );
        await this.s3Service.uploadLargeFile(
          bucketName,
          key,
          file.buffer,
          storageClass,
        );

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
  // Without @aws-sdk/lib-storage : Still facing issue - Malformed XML from S3
  async uploadCompressedFiles(
    userId: string,
    files: Express.Multer.File[],
    body: UploadRequestDto,
  ): Promise<UploadResponseDto> {
    const bucketName = `user-${userId}`;
    const timestamp = new Date().toISOString();

    // Ensure the bucket exists
    await this.bucketExists(bucketName);

    // Create a temporary directory for storing the ZIP
    let tmpDir: tmp.DirResult | null = null;
    try {
      tmpDir = tmp.dirSync({ unsafeCleanup: true }) ?? null;
      const zipFilePath = path.join(tmpDir.name, 'files.zip');

      console.log(`Temporary directory created at: ${tmpDir.name}`);

      // Create a ZIP archive
      const output = fs.createWriteStream(zipFilePath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      archive.pipe(output);

      // Append all files to the archive
      files.forEach((file) => {
        const fileBuffer = file.buffer;
        archive.append(fileBuffer, { name: file.originalname });
      });

      // Finalize the archive
      await new Promise<void>((resolve, reject) => {
        archive.on('close', resolve);
        archive.on('error', reject);
        archive.finalize();
      });

      // Check file size and decide if multipart upload is necessary
      const fileSizeMB = fs.statSync(zipFilePath).size / (1024 * 1024); // in MB
      const PART_SIZE = 500 * 1024 * 1024; // 500MB

      let totalParts: number;

      if (fileSizeMB > 1024 * 10) {
        // 10GB limit check
        totalParts = Math.ceil(fs.statSync(zipFilePath).size / PART_SIZE);
      } else {
        totalParts = 1;
      }

      console.log(
        `Total parts: ${totalParts} for a ZIP file of size ${fileSizeMB}MB`,
      );

      // Initialize Multipart Upload
      const createUploadCommand = new CreateMultipartUploadCommand({
        Bucket: bucketName,
        Key: `compressed-files-${timestamp}.zip`,
        StorageClass: body.storageClass,
      });

      const { UploadId } =
        await this.s3Service.s3Client.send(createUploadCommand);
      if (!UploadId) throw new Error('Failed to create multipart upload');

      const uploadPromises: Promise<any>[] = [];
      const readStream = fs.createReadStream(zipFilePath, {
        highWaterMark: PART_SIZE,
      });

      let partNumber = 1;
      let partBuffer = Buffer.alloc(0);

      // Read the file stream and upload each part
      readStream.on('data', (chunk) => {
        partBuffer = Buffer.concat([
          partBuffer,
          Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk),
        ]);

        if (
          partBuffer.length >= PART_SIZE ||
          readStream.bytesRead === fs.statSync(zipFilePath).size
        ) {
          const uploadPartCommand = new UploadPartCommand({
            Bucket: bucketName,
            Key: `compressed-files-${timestamp}.zip`,
            UploadId,
            PartNumber: partNumber,
            Body: partBuffer,
          });

          uploadPromises.push(
            this.s3Service.s3Client.send(uploadPartCommand).then((result) => {
              console.log(`Uploaded part ${partNumber}`);
              return { PartNumber: partNumber, ETag: result.ETag };
            }),
          );

          partNumber++;
          partBuffer = Buffer.alloc(0); // reset buffer for next part
        }
      });

      // Handle the end of the stream
      readStream.on('end', () => {
        if (partBuffer.length > 0) {
          // Handle the last part if it exists
          const uploadPartCommand = new UploadPartCommand({
            Bucket: bucketName,
            Key: `compressed-files-${timestamp}.zip`,
            UploadId,
            PartNumber: partNumber,
            Body: partBuffer,
          });

          uploadPromises.push(
            this.s3Service.s3Client.send(uploadPartCommand).then((result) => {
              console.log(`Uploaded part ${partNumber}`);
              return { PartNumber: partNumber, ETag: result.ETag };
            }),
          );
        }
      });

      // Wait for all parts to be uploaded
      const parts = await Promise.all(uploadPromises);

      // Complete the Multipart Upload
      const completeUploadCommand = new CompleteMultipartUploadCommand({
        Bucket: bucketName,
        Key: `compressed-files-${timestamp}.zip`,
        UploadId,
        MultipartUpload: { Parts: parts },
      });

      await this.s3Service.s3Client.send(completeUploadCommand);

      console.log('Multipart Upload Complete for compressed ZIP file');

      const s3Url = `s3://${bucketName}/compressed-files-${timestamp}.zip`;

      // Save metadata to DynamoDB
      const uploadItem: UserFilesEntity = {
        userId,
        fileId: uuidv4(),
        key: `compressed-files-${timestamp}.zip`,
        s3Url,
        bucketName,
        storageClass: body.storageClass,
        uploadTimestamp: timestamp,
        fileType: 'application/zip', // File type is ZIP
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
        message: 'Files compressed and uploaded successfully as a ZIP',
        files: [resItem],
      };
    } catch (error) {
      console.error('Error compressing and uploading files', error);
      throw error;
    } finally {
      // Clean up the temporary directory
      tmpDir?.removeCallback();
    }
  }

  // With @aws-sdk/lib-storage
  async uploadCompressedFilesv2(
    userId: string,
    files: Express.Multer.File[],
    body: UploadRequestDto,
  ): Promise<UploadResponseDto> {
    const timestamp = new Date().toISOString();
    const bucketName = `user-${userId}`;

    // Ensure the bucket exists
    await this.bucketExists(bucketName);

    try {
      const archiveStream = new stream.PassThrough();

      const s3UploadParams = {
        Bucket: bucketName,
        Key: `compressed-files-${timestamp}.zip`,
        Body: archiveStream, // Stream the archive directly
        ContentType: 'application/zip',
        StorageClass: body.storageClass,
      };

      const upload = new Upload({
        client: this.s3Service.s3Client,
        params: s3UploadParams,
      });

      const archive = archiver('zip', { zlib: { level: 9 } });
      archive.pipe(archiveStream);

      // Append all files to the archive
      files.forEach((file) => {
        const fileBuffer = file.buffer;
        archive.append(fileBuffer, { name: file.originalname });
      });

      // Finalize the archive
      archive.finalize();

      // Check file size and decide if multipart logic is necessary

      const data = await upload.done();
      console.log('Upload successful:', data);
      const s3Url = `s3://${bucketName}/compressed-files-${timestamp}.zip`;

      // Save metadata to DynamoDB (assuming you still want to store metadata for the file)
      const uploadItem: UserFilesEntity = {
        userId,
        fileId: uuidv4(),
        key: `compressed-files-${timestamp}.zip`,
        s3Url, // Local file path instead of S3 URL
        bucketName: bucketName,
        storageClass: body.storageClass,
        uploadTimestamp: timestamp,
        fileType: 'application/zip', // File type is ZIP
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
      console.error('Error compressing and saving files', error);
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
}
