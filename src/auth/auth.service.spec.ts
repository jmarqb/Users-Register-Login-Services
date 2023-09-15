import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { LoggerService } from '../common/logger/logger.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtPayload } from './interfaces/jwt-payload.interface';


describe('AuthService', () => {
  let service: AuthService;

const mockUsersRepository = {
  findOne: jest.fn()
}
const mockJwtService = {
  sign: jest.fn()
}
const mockLoggerService = {
  warn:jest.fn(),
  log:jest.fn(),
  error: jest.fn()
}

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: 'UserRepository', useValue: mockUsersRepository },
        { provide: JwtService, useValue: mockJwtService },
        { provide: LoggerService, useValue: mockLoggerService }
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should return user data and token when login is successful', async () => {
      const mockUser: Partial<User> = {
        id: 'some-id',
        email: 'test@example.com',
        password: 'hashed-password',
        isActive: true,
      };
      
      jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);
      mockUsersRepository.findOne.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('mock-jwt-token');
  
      const result = await service.login({ email: 'test@example.com', password: 'password123' });
  
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        isActive: mockUser.isActive,
        token: 'mock-jwt-token'
      });
    });
  
    it('should throw BadRequestException when user is inactive', async () => {
      const mockInactiveUser: Partial<User> = {
        id: 'some-id',
        email: 'test@example.com',
        password: 'hashed-password',
        isActive: false,
      };
      
      mockUsersRepository.findOne.mockResolvedValue(mockInactiveUser);
  
      await expect(service.login({ email: 'test@example.com', password: 'password123' }))
        .rejects.toThrow(BadRequestException);
    });
  
    it('should throw UnauthorizedException when user does not exist', async () => {
      mockUsersRepository.findOne.mockResolvedValue(undefined);
  
      await expect(service.login({ email: 'test@example.com', password: 'password123' }))
        .rejects.toThrow(UnauthorizedException);
    });
  
    it('should throw UnauthorizedException when password is incorrect', async () => {
      const mockUser: Partial<User> = {
        id: 'some-id',
        email: 'test@example.com',
        password: 'hashed-password',
        isActive: true,
      };
      
      jest.spyOn(bcrypt, 'compareSync').mockReturnValue(false);
      mockUsersRepository.findOne.mockResolvedValue(mockUser);
  
      await expect(service.login({ email: 'test@example.com', password: 'incorrect-password' }))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  describe('checkAuthStatus', () => {
    it('should return user data and token', async () => {
      const mockUser: Partial<User> = {
        id: 'some-id',
        email: 'test@example.com',
        isActive: true,
      };
  
      mockJwtService.sign.mockReturnValue('mock-jwt-token');
  
      const result = await service.checkAuthStatus(mockUser as User);
  
      expect(result).toEqual({
        user: mockUser,
        token: 'mock-jwt-token'
      });
    });
  });
  
  describe('getJwtToken', () => {
    it('should return a jwt token', () => {
      const payload: JwtPayload = { id: 'some-id' };
      
      mockJwtService.sign.mockReturnValue('mock-jwt-token');
  
      const token = service['getJwtToken'](payload);  // Note the use of ['getJwtToken'] because the method is private.
  
      expect(token).toEqual('mock-jwt-token');
    });
  
    it('should log an error if jwt token cannot be generated', () => {
      const payload: JwtPayload = { id: 'some-id' };
  
      mockJwtService.sign.mockReturnValue(undefined);
      
      service['getJwtToken'](payload);  // Note the use of ['getJwtToken'] because the method is private.
  
      expect(mockLoggerService.error).toHaveBeenCalledWith('Failed to generate JWT token');
    });
  });
  
  
});
