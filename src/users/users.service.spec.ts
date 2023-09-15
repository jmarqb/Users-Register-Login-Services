import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { LoggerService } from '../common/logger/logger.service';
import * as bcrypt from 'bcrypt';
import { BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;

  const mockUsersRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    count: jest.fn(),
    findOne: jest.fn(),
    preload: jest.fn()
  }

  const mockLoggerService = {
    log: jest.fn(),
    error: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: 'UserRepository', useValue: mockUsersRepository },
        { provide: LoggerService, useValue: mockLoggerService }],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  })

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {

    //Define a sample CreateUserDto to use for the test.
    const createUserDto = {
      email: 'test@jest.com',
      password: 'Abc123',
      name: 'Mario'
    };
    it('should create a user successfully', async () => {

      //Mock the hashed password to control the value returned by bcrypt's hashSync.
      const hashedPassword = 'hashedPassword123';
      jest.spyOn(bcrypt, 'hashSync').mockReturnValue(hashedPassword);

      //Define the expected result after creating a user with the given createUserDto
      const createdUser = {
        ...createUserDto,
        password: hashedPassword,
        id: '7a3da9f1-8fa9-4dc0-bff4-a5442262f78c',
        roles: ['user'],
        isActive: true
      }

      //Mock the behavior of the userRepository's create and save methods.
      mockUsersRepository.create.mockReturnValue(createdUser);
      mockUsersRepository.save.mockResolvedValue(createdUser);

      // Call the service's create method with the sample CreateUserDto.
      const result = await service.create(createUserDto);

      //Assert that the userRepository's create method was called with the correct data.
      expect(mockUsersRepository.create).toHaveBeenCalledWith({
        ...createUserDto,
        password: hashedPassword
      });

      //Assert that the userRepository's save method was called with the created user.
      expect(mockUsersRepository.save).toHaveBeenCalledWith(createdUser);

      //Assert that the logger's log method was called with the success message.
      expect(mockLoggerService.log).toHaveBeenCalledWith('User created successfully');

      //Assert that the service's create method returns the expected result, 
      // excluding the password and isActive fields.
      expect(result).toEqual({
        email: createUserDto.email,
        name: createUserDto.name,
        id: '7a3da9f1-8fa9-4dc0-bff4-a5442262f78c',
        roles: ['user']
      });
    });

    //Handling Error 500 InternalServerException
    it('should throw an error 500 when something goes wrong', async () => {
      mockUsersRepository.create.mockRejectedValue(new InternalServerErrorException('Simulated error in database'));
      await expect(service.create(createUserDto)).rejects.toThrow(InternalServerErrorException);

      expect(mockLoggerService.error.mock.calls[1][0]).toBe('Error Unknow in database.');
    });

    //Handling Error 400 BadRequestException - Duplicate Key
    it('should throw an error 400 when user already exists in database', async () => {

      mockUsersRepository.create.mockRejectedValue({
        message: 'Simulated error in database',
        code: '23505'
      });

      await expect(service.create(createUserDto)).rejects.toThrow(BadRequestException);
      expect(mockLoggerService.error.mock.calls[1][0]).toBe('Duplicate Key.');

    });

    //Handling Error 400 BadRequestException - User Inactive
    it('should throw an error 400 when user is inactive ', async () => {

      mockUsersRepository.create.mockRejectedValue({
        message: 'Simulated error in database',
        code: '741'
      });

      await expect(service.create(createUserDto)).rejects.toThrow(BadRequestException);
      expect(mockLoggerService.error.mock.calls[1][0]).toBe('The user is inactive in database');

    });

  });

  describe('findAll', () => {
    const mockPaginationDto = {
      limit: 5,
      offset: 0
    };
    it('should retrieve all users', async () => {

      // Mock the data returned by the repository methods.
      const mockUsers = [
        {
          "id": "08568129-f387-4a7c-9407-85e92f7e4139",
          "email": "test2@google.com",
          "name": "test2",
          "isActive": true,
          "roles": [
            "user"
          ]
        },
        {
          "id": "fe42ed62-50d5-4ad0-9521-a761848c1d40",
          "email": "test3@google.com",
          "name": "test3",
          "isActive": true,
          "roles": [
            "user"
          ]
        },
      ];
      // Verify that the repository was called with the correct parameters.
      mockUsersRepository.find.mockResolvedValue(mockUsers);
      mockUsersRepository.count.mockResolvedValue(20);

      const result = await service.findAll(mockPaginationDto);

      expect(mockUsersRepository.find).toHaveBeenCalledWith({
        take: mockPaginationDto.limit,
        skip: mockPaginationDto.offset,
        where: { isActive: true }
      });

      expect(mockUsersRepository.count).toHaveBeenCalledWith({ where: { isActive: true } });

      // Check the returned result.
      expect(result).toEqual({
        items: mockUsers,
        total: 20,
        currentPage: 1,
        totalPages: 4
      });

      // Verify that the logger was called.
      expect(mockLoggerService.log).toHaveBeenCalledWith('Operation find users success');


    });

  });

  describe('findOne', () => {

    const id = '08568129-f387-4a7c-9407-85e92f7e4139'
    const invalidId = 'invalid-uuid'

    const mockUser =
    {
      "id": "08568129-f387-4a7c-9407-85e92f7e4139",
      "email": "test2@google.com",
      "name": "test2",
      "isActive": true,
      "roles": ["user"]
    }
    it('should return a user', async () => {

      // Verify that the repository was called with the correct parameters.
      mockUsersRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne(id);

      expect(mockUsersRepository.findOne).toHaveBeenCalledWith({ where: { id } })

      // Check the returned result.
      expect(result).toEqual(mockUser);

      // Verify that the logger was called.
      expect(mockLoggerService.log).toHaveBeenCalledWith('Find user by id success');

    });

    it('should throw BadRequestException if id is a invalid UUID', async () => {
      mockUsersRepository.findOne.mockRejectedValue('Simulated error in database');

      await expect(service.findOne(invalidId)).rejects.toThrow(BadRequestException);
      expect(mockLoggerService.log).toHaveBeenCalledWith('Invalid UUID');

    });

    it('should throw an error 400 when user is inactive ', async () => {
      const inactiveUser = {
        ...mockUser,
        isActive: false
      };
      // Mock to return the inactive user.
      mockUsersRepository.findOne.mockResolvedValue(inactiveUser);

      // This should trigger the error due to user being inactive.
      await expect(service.findOne(id)).rejects.toThrow(BadRequestException);
      expect(mockLoggerService.error).toHaveBeenCalledWith('The user is inactive in database', expect.anything());
    });

    it('should throw NotFoundException if user not exists in database', async () => {
      mockUsersRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(id)).rejects.toThrow(NotFoundException);
      expect(mockLoggerService.log).toHaveBeenCalledWith('User not exists in database');
    });
  });

  describe('update', () => {

    const invalidId = 'InvalidID';
    const validId = '7a3da9f1-8fa9-4dc0-bff4-a5442262f78c';

    const mockUpdDto = {
      email: 'test@google.com',
      password: 'ABC123',
      name: 'test'
    }

    const mockUpdatedUser = {
      id: validId,
      ...mockUpdDto,
      roles: ['user'],
      isActive: true
    };

    it('should update user details if provided valid data', async () => {

      //Mock the hashed password to control the value returned by bcrypt's hashSync.
      const hashedPassword = 'hashedPassword123';
      jest.spyOn(bcrypt, 'hashSync').mockReturnValue(hashedPassword);

      //Define the expected result after creating a user with the given createUserDto
      const mockUpdatedUser = {
        ...mockUpdDto,
        password: hashedPassword,
        id: validId,
        roles: ['user'],
      }

      //Mock the behavior of the userRepository's preload method
      mockUsersRepository.preload.mockResolvedValue(mockUpdatedUser);
      mockUsersRepository.findOne.mockResolvedValue(mockUpdatedUser);

      // Call the service's update method with the sample mockUserDto.
      const result = await service.update(validId, mockUpdDto);

      expect(mockUsersRepository.save).toHaveBeenCalledWith(mockUpdatedUser);

      //Assert that the logger's log method was called with the success message.
      expect(mockLoggerService.log).toHaveBeenCalledWith('User updated successfully');

      //Assert that the service's updated method returns the expected result, 
      // excluding the password and isActive fields.
      expect(result).toEqual({
        email: mockUpdDto.email,
        name: mockUpdDto.name,
        id: '7a3da9f1-8fa9-4dc0-bff4-a5442262f78c',
        roles: ['user']
      });
    });

    it('should throw BadRequestException if id is a invalid UUID', async () => {
      mockUsersRepository.findOne.mockRejectedValue('Simulated error in database');

      await expect(service.findOne(invalidId)).rejects.toThrow(BadRequestException);
      expect(mockLoggerService.log).toHaveBeenCalledWith('Invalid UUID');

    });

    it('should throw NotFoundException if user not exists in database', async () => {
      mockUsersRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(validId)).rejects.toThrow(NotFoundException);
      expect(mockLoggerService.log).toHaveBeenCalledWith('User not exists in database');
    });

    it('should throw an error 400 when user is inactive ', async () => {
      const inactiveUser = {
        ...mockUpdatedUser,
        isActive: false
      };
      // Mock to return the inactive user.
      mockUsersRepository.findOne.mockResolvedValue(inactiveUser);

      // This should trigger the error due to user being inactive.
      await expect(service.findOne(validId)).rejects.toThrow(BadRequestException);
      expect(mockLoggerService.error).toHaveBeenCalledWith('The user is inactive in database', expect.anything());
    });

  });

  describe('remove', () => {
    const validId = '7a3da9f1-8fa9-4dc0-bff4-a5442262f78c';

    const mockUser = {
        id: validId,
        email: 'test@google.com',
        password: 'hashedPassword123',
        name: 'test',
        roles: ['user'],
        isActive: true
    };

    it('should mark a user as inactive and return the user', async () => {
        // Mock the findOne method to return the mock user.
        mockUsersRepository.findOne.mockResolvedValue(mockUser);

        // Mock the save method to just return the user that was given (mimicking save behavior).
        mockUsersRepository.save.mockImplementation((user) => Promise.resolve(user));

        // Call the remove method
        const result = await service.remove(validId);

        // Check if findOne was called with the correct ID
        expect(mockUsersRepository.findOne).toHaveBeenCalledWith({ where: { id: validId } });

        // Check if the user's isActive property is set to false
        expect(result.isActive).toBe(false);

        // Check if the save method was called with the updated user
        expect(mockUsersRepository.save).toHaveBeenCalledWith({
            ...mockUser,
            isActive: false
        });

        // Check if the logger's log method was called with the success message.
        expect(mockLoggerService.log).toHaveBeenCalledWith('Delete user success');
    });

    it('should throw an error if user is already inactive', async () => {
        // Mock the findOne method to return the user as inactive
        mockUsersRepository.findOne.mockResolvedValue({
            ...mockUser,
            isActive: false
        });

        // Expect that calling the remove method with the validId should throw a BadRequestException
        await expect(service.remove(validId)).rejects.toThrow(BadRequestException);

        // Check if the logger's error method was called with the error message.
        expect(mockLoggerService.error.mock.calls).toEqual(
          expect.arrayContaining([
             ['The user is inactive in database', `The user with id ${validId} is inactive in database`]
          ])
       );
       
    });

});

})
