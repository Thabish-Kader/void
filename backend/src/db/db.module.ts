import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { DbService } from './db.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'DYNAMODB_CLIENT',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const client = new DynamoDBClient({
          region: configService.get('AWS_REGION'),
        });

        return DynamoDBDocumentClient.from(client);
      },
    },
    DbService,
  ],
  exports: ['DYNAMODB_CLIENT', DbService],
})
export class DbModule {}
