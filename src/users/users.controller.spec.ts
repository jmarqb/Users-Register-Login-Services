import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import { PersonalizedError } from '../common/interfaces/paginated-result.interface';
import { PaginationDto } from '../common/dto/pagination.dto';
import { LoggerService } from '../common/logger/logger.service';

describe('UsersController', () => {
  let controller: UsersController;

  const mockUsersService = {
    create: jest.fn().mockImplementation((dto: CreateUserDto) => Promise.resolve({
      email: dto.email,
      name: dto.name,
      id: '7a3da9f1-8fa9-4dc0-bff4-a5442262f78c',
      roles: ['user']
    })),

    findAll: jest.fn().mockImplementation((pagDto: PaginationDto) => Promise.resolve({
      items: ['id', 'email', 'name', 'isActive', 'roles'],
      total: 10,
      currentPage: 1,
      totalPages: 5
    })),

    findOne: jest.fn().mockImplementation((id: string) => Promise.resolve({
      id: 'c573e986-fb91-475c-9043-1b4c05bec643',
      email: 'test80@google.com',
      name: 'test20',
      isActive: true,
      roles: ['user']
    })),

    update: jest.fn().mockImplementation((id: string, updDto: UpdateUserDto) => Promise.resolve({
      id: 'c573e986-fb91-475c-9043-1b4c05bec643',
      email: 'test80@google.com',
      name: 'test20',
      isActive: true,
      roles: ['user']
    })),

    remove: jest.fn().mockImplementation((id: string) => Promise.resolve({
      id: 'c573e986-fb91-475c-9043-1b4c05bec643',
      email: 'test80@google.com',
      name: 'test20',
      isActive: true,
      roles: ['user']
    }))

  }
  const mockUserRepository = {};

  const mockLoggerService = {
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        { provide: 'UserRepository', useValue: mockUserRepository },
        { provide: LoggerService, useValue: mockLoggerService }

      ],
    }).overrideProvider(UsersService).useValue(mockUsersService).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {

    //Create User method
    it('should be create a user', async () => {
      const dto = {
        email: 'test@jest.com',
        password: 'Abc123',
        name: 'Mario'
      };
      const result = await controller.create(dto);

      // Verify if the function create was called with a valid dto
      expect(mockUsersService.create).toHaveBeenCalledWith(dto);

      //Check the value returned
      expect(result).toEqual({
        email: result.email,
        name: result.name,
        id: '7a3da9f1-8fa9-4dc0-bff4-a5442262f78c',
        roles: ['user']
      });
    });

    //Handling Error 500 InternalServerException
    it('should throw an error 500 when something goes wrong', async () => {
      mockUsersService.create.mockRejectedValue(new InternalServerErrorException('Simulated DB Error'));
      await expect(controller.create({
        email: 'test@jest.com',
        password: 'Abc123',
        name: 'Mario'
      })).rejects.toThrow(InternalServerErrorException);
    });

    //Handling Error 400 BadRequestException
    it('should throw an error 400 when user already exists or is inactive in database', async () => {
      mockUsersService.create.mockRejectedValue(new BadRequestException('Simulated error in database'));
      await expect(controller.create({
        email: 'test@jest.com',
        password: 'Abc123',
        name: 'Mario'
      })).rejects.toThrow(BadRequestException);

    });
  });

  describe('findAll', () => {
    //findAll method return correct data
    it('should be return Array of users and paginated data', async () => {
      const pagDto = {
        limit: 10,
        offset: 0
      };

      await controller.findAll(pagDto);

      // Verify if the function create was called with a valid dto
      expect(mockUsersService.findAll).toHaveBeenCalledWith(pagDto);

      //Check the value returned
      await expect(controller.findAll(pagDto)).resolves.toEqual({
        items: ['id', 'email', 'name', 'isActive', 'roles'],
        total: 10,
        currentPage: 1,
        totalPages: 5
      });

    });

    //findAll method return empty list no users are present
    it('should return an empty list when no users are present', async () => {

      mockUsersService.findAll.mockResolvedValue({
        items: [],
        total: 0,
        currentPage: 1,
        totalPages: 0
      });

      const paginationDto = {
        limit: 10,
        offset: 0
      };

      await expect(controller.findAll(paginationDto)).resolves.toEqual({
        items: [],
        total: 0,
        currentPage: 1,
        totalPages: 0
      });
    });

    //findAll method test to return only active users
    it('should only return active users', async () => {

      mockUsersService.findAll.mockResolvedValue({
        items: [
          { id: '2', email: 'active@jest.com', name: 'ActiveUser', isActive: true, roles: ['user'] },
        ],
        total: 1,
        currentPage: 1,
        totalPages: 1
      });

      const paginationDto = {
        limit: 10,
        offset: 0
      };

      const result = await controller.findAll(paginationDto);

      expect(result.items).not.toContainEqual({
        id: '1', email: 'inactive@jest.com', name: 'InactiveUser', isActive: false, roles: ['user']
      });
    });
  });

  describe('findOne', () => {
    //findOne Method Invalid UUiD
    it('should throw an BadRequestException when is a Invalid UUID', async () => {
      const invalidId = 'InvalidID';

      mockUsersService.findOne.mockRejectedValue(new BadRequestException('Invalid UUID'));

      await expect(controller.findOne(invalidId)).rejects.toThrow(BadRequestException);
    });

    //findOne User Not Found in database
    it('should throw an NotFoundException when user not exists in database', async () => {
      const validId = '7a3da9f1-8fa9-4dc0-bff4-a5442262f78c';

      // Mock the service to return a rejected promise with NotFoundException
      mockUsersService.findOne.mockRejectedValue(new NotFoundException('User not exists in database'));

      // Expect the controller to throw a NotFoundException
      await expect(controller.findOne(validId)).rejects.toThrow(NotFoundException);

    });

    //findOne method -valid UUID- User status isActive = false
    it('should throw a BadRequestException when User is inactive in database', async () => {
      const validId = '7a3da9f1-8fa9-4dc0-bff4-a5442262f78c';
      // Mock the service to return a rejected promise with BadRequest
      mockUsersService.findOne.mockRejectedValue(new BadRequestException('The user is inactive in database'));

      // Expect the controller to throw a NotFoundException
      await expect(controller.findOne(validId)).rejects.toThrow(BadRequestException);
    });

    //findOne method -return correct data
    it('should return the correct user data for a valid UUID', async () => {
      const validId = '3e4968e4-4ebc-48ad-9c5e-2d80bf2d3f13';

      mockUsersService.findOne.mockResolvedValue({
        id: '3e4968e4-4ebc-48ad-9c5e-2d80bf2d3f13',
        email: 'test3@google.com',
        name: 'test3',
        isActive: true,
        roles: ['user']
      })

      const result = await controller.findOne(validId);

      // Verify if the function findOne was called with a valid id
      expect(mockUsersService.findOne).toHaveBeenCalledWith(validId);

      //Check the value returned
      expect(result).toEqual({
        id: '3e4968e4-4ebc-48ad-9c5e-2d80bf2d3f13',
        email: 'test3@google.com',
        name: 'test3',
        isActive: true,
        roles: ['user']
      });
    });
  });

  describe('update', () => {

    const invalidId = 'InvalidID';
    const validId = 'ValidID';

    const updDto = {
      email: 'test@google.com',
      password: 'ABC123',
      name: 'test'
    }

    const updatedUser = {
      id: validId,
      ...updDto,
      roles: ['user'],
      isActive: true
    };

    // Supose if service return a updated user
    mockUsersService.update.mockResolvedValue(updatedUser);

    it('should update user details if provided valid data', async () => {
      expect(await controller.update(validId, updDto)).toEqual(updatedUser);
      expect(mockUsersService.update).toHaveBeenCalledWith(validId, updDto);
    });

    it('should throw an BadRequestException when is a Invalid UUID', async () => {

      mockUsersService.update.mockRejectedValue(new BadRequestException('Invalid UUID'));

      await expect(controller.update(invalidId, updDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockUsersService.update.mockRejectedValue(new NotFoundException('User not found'));
      await expect(controller.update('non-existent-uuid', updDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw a personalized error when user is inactive', async () => {

      const err_p: PersonalizedError = {
        code: '741',
        detail: `The user is inactive in database`
      }
      //personalized error throw a 400 badrequest with the message The user with id ValidID is inactive in database
      mockUsersService.update.mockRejectedValue(new BadRequestException(`${err_p.detail}`));
      await expect(controller.update(validId, updDto)).rejects.toThrow(`${err_p.detail}`);
    });

    it('should throw BadRequestException if password is wrong', async () => {
      mockUsersService.update.mockRejectedValue(new BadRequestException('Bad Request Exception'));
      const userWithPassword = { ...updDto, password: 'plaintext' };

      await expect(controller.update(validId, userWithPassword)).rejects.toThrow(BadRequestException);
    });

  });

  describe('remove', () => {

    const invalidId = 'InvalidID';
    const validId = 'ValidID';

    const removedUser = {
      id: 'c573e986-fb91-475c-9043-1b4c05bec643',
      email: 'removed@google.com',
      name: 'removedName',
      isActive: false,
      roles: ['user']
    };

    it('should throw an BadRequestException when is a Invalid UUID', async () => {

      mockUsersService.remove.mockRejectedValue(new BadRequestException('Invalid UUID'));

      await expect(controller.remove(invalidId)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockUsersService.remove.mockRejectedValue(new NotFoundException('User not found'));
      await expect(controller.remove('non-existent-uuid')).rejects.toThrow(NotFoundException);
    });

    it('should throw a personalized error when user is inactive', async () => {

      const err_p: PersonalizedError = {
        code: '741',
        detail: `The user is inactive in database`
      }
      //personalized error throw a 400 badrequest with the message The user with id ValidID is inactive in database
      mockUsersService.remove.mockRejectedValue(new BadRequestException(`${err_p.detail}`));
      await expect(controller.remove(validId)).rejects.toThrow(`${err_p.detail}`);
    });

    it('should remove user details if provided valid data', async () => {
      mockUsersService.remove.mockResolvedValue(removedUser);

      expect(await controller.remove(validId)).toEqual(removedUser);
      expect(mockUsersService.remove).toHaveBeenCalledWith(validId);
    });
  });

});


