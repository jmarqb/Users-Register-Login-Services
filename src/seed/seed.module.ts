import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';

@Module({
  controllers: [SeedController],
  providers: [SeedService],
  imports:[TypeOrmModule.forFeature([User])]
})
export class SeedModule {}
