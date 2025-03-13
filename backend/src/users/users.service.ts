import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto';
import { User } from './entities';

@Injectable()
export class UsersService {
  constructor(private readonly repository: UsersRepository) {}
  async create(createUserDto: CreateUserDto) {
    const user = await this.repository.findByEmail(createUserDto.email);
    if (user)
      throw new ConflictException(
        `User with ${createUserDto.email} already exists`,
      );

    return this.repository.upsertOne(User.createUserFromDTO(createUserDto));
  }

  findAll() {
    return this.repository.findAll();
  }

  async findOne(id: string) {
    const user = await this.repository.findByEmail(id);
    if (!user) throw new NotFoundException(`User with id ${id} not found`);
    return user;
  }

  // update(id: number, updateUserDto: UpdateUserDto) {
  //   return `This action updates a #${id} user`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} user`;
  // }
}
