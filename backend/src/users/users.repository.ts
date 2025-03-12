import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';
import { Injectable } from '@nestjs/common';
import { DbService } from 'src/db/db.service';
// import { UserDto } from './dto';

@Injectable()
export class UsersRepository {
  private readonly tablename = 'User';
  private readonly client: DynamoDBClient;

  constructor(private readonly dbService: DbService) {
    this.client = dbService.getDynamoDBClient();
  }

  async findAll() {
    let result: any = [];

    const command = new ScanCommand({
      TableName: this.tablename,
    });

    const response = await this.client.send(command);

    if (response.Items) {
      result = response.Items;
    }
    console.log(result);
    return result;
  }
}
