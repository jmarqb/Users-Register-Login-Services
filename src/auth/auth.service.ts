import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';

import { LoginDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { LoggerService } from '../common/logger/logger.service';
import { LoginResponse } from './interfaces/login-response.interface';

@Injectable()
export class AuthService {

    constructor(
        @InjectRepository(User)
        private readonly userRepository:Repository<User>,
        private readonly jwtService:JwtService,
        private readonly logger: LoggerService
    ){}

    async login(loginDto: LoginDto):Promise<LoginResponse> {

        const { password, email } = loginDto;
    
        const user = await this.userRepository.findOne({
          where: { email },
          select: { email: true, password: true, id: true, isActive: true } 
        });
        if (!user){
          this.logger.warn(`Failed login attempt for user,Credentials are not valid`);
          throw new UnauthorizedException('Credentials are not valid');
        }

        if(user.isActive === false){
          throw new BadRequestException(`The user is not active in database`)
        }

    
        if (!bcrypt.compareSync(password, user.password)){
          this.logger.warn(`Failed login attempt for user,Credentials are not valid`);
           throw new UnauthorizedException('Credentials are not valid');
        }
    
          delete user.password;

          this.logger.log(`User ${email} logged in successfully`);
        return {
          ...user,
          token: this.getJwtToken({ id: user.id })
        };
    
      } 
    
      async checkAuthStatus(user: User) {
        return {
          user,
          token: this.getJwtToken({ id: user.id })
        }
      }
    
      private getJwtToken(payload: JwtPayload) {
    
        const token = this.jwtService.sign(payload);
    
        if(!token){
          this.logger.error('Failed to generate JWT token');
        }
        return token;
      }
    
      private handlerDBErrors(error: any): never {
        this.logger.error(`Database Error: ${error.code}`, error.detail);
        
        if (error.code === '23505')
          throw new BadRequestException(error.detail);
    
        console.log(error);
    
        throw new InternalServerErrorException(`Please check server logs`);
    
      }
}
