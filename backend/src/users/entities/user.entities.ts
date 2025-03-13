import { AttributeValue } from '@aws-sdk/client-dynamodb';

export class User {
  userId: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;

  static parseUser(data: Record<string, AttributeValue>): User {
    const result = new User();

    if (data.userId?.S) result.userId = data.userId.S;
    if (data.email?.S) result.email = data.email.S;
    if (data.name?.S) result.name = data.name.S;
    if (data.createdAt?.N)
      result.createdAt = new Date(Number(data.createdAt.N));
    if (data.updatedAt?.N)
      result.updatedAt = new Date(Number(data.updatedAt.N));

    return result;
  }
}
