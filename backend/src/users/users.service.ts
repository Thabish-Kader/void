import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
// import { CreateUserDto } from './dto/create-user.dto';
// import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly repository: UsersRepository) {}
  // create(createUserDto: CreateUserDto) {
  //   return 'This action adds a new user';
  // }

  findAll() {
    return this.repository.findAll();
  }

  // findOne(id: number) {
  //   return `This action returns a #${id} user`;
  // }

  // update(id: number, updateUserDto: UpdateUserDto) {
  //   return `This action updates a #${id} user`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} user`;
  // }
}
