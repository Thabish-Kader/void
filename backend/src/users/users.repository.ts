import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';
import { Injectable } from '@nestjs/common';
import { DbService } from 'src/db/db.service';
import { User } from './entities';

@Injectable()
export class UsersRepository {
  private readonly tablename = 'User';
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
}
