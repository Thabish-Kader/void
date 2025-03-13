import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  QueryCommand,
  ScanCommand,
} from '@aws-sdk/client-dynamodb';
import { Injectable } from '@nestjs/common';
import { DbService } from 'src/db/db.service';
import { User } from './entities';

@Injectable()
export class UsersRepository {
  private readonly tablename = 'User';
  private readonly indexName = 'email-index';
  private readonly client: DynamoDBClient;

  constructor(private readonly dbService: DbService) {
    this.client = dbService.getDynamoDBClient();
  }

  async findAll() {
    const result: User[] = [];

    const command = new ScanCommand({
      TableName: this.tablename,
    });

    const response = await this.client.send(command);

    if (response.Items) {
      response.Items.forEach((item) => {
        result.push(User.parseUser(item));
      });
    }

    return result;
  }

  async findById(id: string) {
    const command = new GetItemCommand({
      TableName: this.tablename,
      Key: {
        userId: { S: id },
      },
    });

    const result = await this.client.send(command);

    if (result.Item) return User.parseUser(result.Item);

    return null;
  }

  async findByEmail(email: string) {
    const command = new QueryCommand({
      TableName: this.tablename,
      IndexName: this.indexName,
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': { S: email },
      },
      ProjectionExpression: 'userId, email',
    });

    const result = await this.client.send(command);

    if (result.Items && result.Items?.length >= 1)
      return User.parseUser(result.Items[0]);

    return null;
  }

  async upsertOne(user: User) {
    const command = new PutItemCommand({
      TableName: this.tablename,
      Item: {
        userId: { S: user.userId },
        email: { S: user.email },
        name: { S: user.name },
        password: { S: user.password },
        createdAt: { N: String(user.createdAt.getTime()) },
        updatedAt: { N: String(user.updatedAt.getTime()) },
      },
    });

    await this.client.send(command);
    return user;
  }
}
