import { IsString, IsEmail, IsDateString } from 'class-validator';

export class UserDto {
  @IsString()
  userId: string;

  @IsDateString()
  createdAt: string;

  @IsEmail()
  email: string;

  @IsDateString()
  updatedAt: string;

  @IsString()
  name: string;
}
