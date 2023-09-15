import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { User } from '../../users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UnauthorizedException } from '@nestjs/common';

export class JwtStrategy extends PassportStrategy(Strategy){

    constructor(
        @InjectRepository(User)
        private readonly userRepository:Repository<User>,
        configService:ConfigService
    ){
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: configService.get('JWT_SECRET'),
            ignoreExpiration: false
        });
    }

    async validate(payload: JwtPayload):Promise<User>{

        const {id} = payload;

        const user = await this.userRepository.findOne({where:{id}});

        if(!user){
            throw new UnauthorizedException(`Token not valid`);
        }
        if (!user.isActive) {
            throw new UnauthorizedException('User is inactive. Please contact the administrator.');
        }
        return user;
    }
}