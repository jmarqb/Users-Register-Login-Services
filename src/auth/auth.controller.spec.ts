import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoggerService } from '../common/logger/logger.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { LoginResponse } from './interfaces/login-response.interface';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockUserRepository = {};
  const mockJwtService = {};
  const mockLoggerService = {
    log: jest.fn(),
    error: jest.fn(),
  };

  const loginDto: LoginDto = {
    email: 'test@example.com',
    password: 'password123',
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        { provide: 'UserRepository', useValue: mockUserRepository },
        { provide: JwtService, useValue: mockJwtService },
        { provide: LoggerService, useValue: mockLoggerService }
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService); // Here, getting authService
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('loginUser', () => {
    it('should return user data and token when login is successful', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      // Mock the behavior of the authService's login method to return a user and token.
      const mockUser:LoginResponse = {
        id: 'user-id',
        email: 'test@example.com',
        isActive: true,
        token: 'mock-token',
    };
      jest.spyOn(authService, 'login').mockResolvedValue(mockUser);

      const result = await controller.loginUser(loginDto);

      expect(result).toEqual({
        id: 'user-id',
        email: 'test@example.com',
        isActive: true,
        token: 'mock-token',
      });
    });

    it('should throw UnauthorizedException when login credentials are invalid', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'invalid-password',
      };

      // Mock the behavior of the authService's login method to throw UnauthorizedException.
      jest.spyOn(authService, 'login').mockRejectedValue(new UnauthorizedException('Credentials are not valid'));

      // Ensure that calling loginUser with invalid credentials throws UnauthorizedException.
      await expect(controller.loginUser(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw BadRequestException when user is not active', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      // Mock the behavior of the authService's login method to throw BadRequestException.
      jest.spyOn(authService, 'login').mockRejectedValue(new BadRequestException('The user is not active in database'));

      // Ensure that calling loginUser with an inactive user throws BadRequestException.
      await expect(controller.loginUser(loginDto)).rejects.toThrow(BadRequestException);
    });
  });
});

