import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { DbService } from 'src/db/db.service';
import { S3Service } from 'src/s3/s3.service';

@Injectable()
export class UploadRepository {
  private readonly s3Client: S3Client;
  private readonly dbClient: DynamoDBClient;

  constructor(
    private readonly dbService: DbService,
    private readonly s3Service: S3Service,
  ) {
    this.s3Client = s3Service.getS3Client();
    this.dbClient = dbService.getDynamoDBClient();
  }
}
