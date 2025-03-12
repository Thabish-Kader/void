import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { Injectable } from '@nestjs/common';
// import { UserDto } from './dto';

@Injectable()
export class UsersRepository {
  private readonly tablename = 'users';
  private readonly client: DynamoDBClient;
  private readonly ddbDocClient: DynamoDBDocument;

  constructor() {
    this.ddbDocClient = DynamoDBDocument.from(
      new DynamoDBClient({
        region: 'ap-south-1',
      }),
    );
  }

  async findAll() {
    let result: any = [];

    const command = new ScanCommand({
      TableName: this.tablename,
    });

    const response = await this.ddbDocClient.send(command);

    if (response.Items) {
      result = response.Items;
    }
    console.log(result);
    return result;
  }
}
