import { S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getEnv } from 'src/utils';

@Injectable()
export class S3Service {
  private readonly s3Client: S3Client;

  constructor(private readonly configService: ConfigService) {
    this.s3Client = new S3Client({
      region: getEnv(this.configService, 'AWS_REGION'),
      credentials: {
        accessKeyId: getEnv(this.configService, 'AWS_ACCESS_KEY_ID'),
        secretAccessKey: getEnv(this.configService, 'AWS_SECRET_ACCESS_KEY'),
      },
    });
  }

  getS3Client(): S3Client {
    return this.s3Client;
  }
}
