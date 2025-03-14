import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getEnv } from 'src/utils';

@Injectable()
export class DbService {
  private readonly client: DynamoDBClient;
  private readonly region: string;
  private readonly accessKeyId: string;
  private readonly secretAccessKey: string;

  constructor(private readonly configService: ConfigService) {
    this.region = getEnv(this.configService, 'AWS_REGION');
    this.accessKeyId = getEnv(this.configService, 'AWS_SECRET_ACCESS_KEY');
    this.secretAccessKey = getEnv(this.configService, 'AWS_SECRET_ACCESS_KEY');

    this.client = new DynamoDBClient({
      region: this.region,
      credentials: {
        accessKeyId: this.accessKeyId,
        secretAccessKey: this.secretAccessKey,
      },
    });
  }

  getDynamoDBClient(): DynamoDBClient {
    return this.client;
  }
}
