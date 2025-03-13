import { AttributeValue } from '@aws-sdk/client-dynamodb';
import { CreateUserDto } from '../dto';
import { v4 as uuidv4 } from 'uuid';
export class User {
  userId: string;
  email: string;
  name: string;
  password: string;
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

  static createUserFromDTO(data: CreateUserDto): User {
    const user = new User();
    user.userId = uuidv4();
    user.email = data.email;
    user.name = data.name;
    user.password = data.password;
    user.createdAt = new Date();
    user.updatedAt = new Date();

    return user;
  }
}
