import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';
import { validate as isUUID } from 'uuid'

import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResult, PersonalizedError } from '../common/interfaces/paginated-result.interface';
import { LoggerService } from '../common/logger/logger.service';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly logger: LoggerService
  ) { }

  //create user
  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password' | 'isActive'>> {

    const { password, ...userData } = createUserDto;
    const pass_encrypted = bcrypt.hashSync(password, 10);

    try {
      const user = await this.userRepository.create({
        password: pass_encrypted,
        ...userData
      });

      await this.userRepository.save(user);
      delete user.password;
      delete user.isActive;

      this.logger.log('User created successfully');

      return user;

    } catch (error) {
      this.handlerDbErrors(error);
    }
  }

  //find all users paginate
  async findAll(paginationDto: PaginationDto): Promise<PaginatedResult<User>> {

    const { limit = 10, offset = 0 } = paginationDto;

    const users = await this.userRepository.find({
      take: limit,
      skip: offset,
      where: ({ isActive: true }) //Only Active Users
    });

    const total = await this.userRepository.count({ where: { isActive: true } });
    const totalPages = Math.ceil(total / limit);

    this.logger.log('Operation find users success');

    return {
      items: users,
      total: total,
      currentPage: offset / limit + 1,
      totalPages: totalPages
    };;
  }

  //find user by id: valid UUID
  async findOne(id: string): Promise<User> {

    let user: User;

    if (!isUUID(id)) {
      this.logger.log('Invalid UUID');
      throw new BadRequestException(`The id must be a valid UUID`);
    } else {
      user = await this.userRepository.findOne({ where: { id } });
      if (user !== null && user.isActive === false) {
        const err_p: PersonalizedError = {
          code: '741',
          detail: `The user with id ${id} is inactive in database`
        }
        this.handlerDbErrors(err_p);
      }
    }
      
    if (!user){
      console.log(user);
      this.logger.log('User not exists in database');
      throw new NotFoundException(`User with id: ${id} not exists in database`);
    }

    this.logger.log('Find user by id success');
    return user;
  }

  //Update user by id: valid UUID
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {

    const { ...rest } = updateUserDto;

    if (!isUUID(id)) {
      throw new BadRequestException(`The id must be a valid UUID`);
    }

    if (rest.password) {
      rest.password = bcrypt.hashSync(rest.password, 10);
    }
    const user = await this.userRepository.preload({ id, ...rest })

    if (!user)
      throw new NotFoundException(`User with id: ${id} not exists in database`);

    if (user.isActive === false) {
      const err_p: PersonalizedError = {
        code: '741',
        detail: `The user with id ${id} is inactive in database`
      }
      this.handlerDbErrors(err_p);
    }

    delete user.password;
    try {

      await this.userRepository.save(user);
    } catch (error) {
      this.handlerDbErrors(error);
    }

    this.logger.log('User updated successfully');
    return user;
  }

  async remove(id: string) {

    const user = await this.findOne(id);
    if (user.isActive === false) {
      const err_p: PersonalizedError = {
        code: '741',
        detail: `The user with id ${id} is inactive in database`
      }
      this.handlerDbErrors(err_p);
    }
    //Option 1:
    //remove from database
    // await this.userRepository.remove(user);

    //TODO: Option 2 : change isActive : FALSE
    user.isActive = false;
    await this.userRepository.save(user);

    this.logger.log('Delete user success');
    return user;
  }

  private handlerDbErrors(error: any): never {
    this.logger.error(`Error DB: ${error.code}`, error.detail);

    switch (error.code) {
      case '23505':
        this.logger.error('Duplicate Key.', error.detail);
        throw new BadRequestException('The element already exists in database.');

      case '741':
        this.logger.error('The user is inactive in database', error.detail);
        throw new BadRequestException('The user is inactive in database.');

      default:
        this.logger.error('Error Unknow in database.', error);
        throw new InternalServerErrorException('Please check server logs.');
    }

  }


}
