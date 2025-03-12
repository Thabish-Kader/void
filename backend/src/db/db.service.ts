import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DbService {
  private readonly client: DynamoDBClient;

  constructor(configService: ConfigService) {
    this.client = new DynamoDBClient({
      region: configService.get('AWS_REGION'),
      credentials: {
        accessKeyId: configService.get('AWS_ACCESS_KEY_ID') as string,
        secretAccessKey: configService.get('AWS_SECRET_ACCESS_KEY') as string,
      },
    });
  }

  getDynamoDBClient(): DynamoDBClient {
    return this.client;
  }
}
