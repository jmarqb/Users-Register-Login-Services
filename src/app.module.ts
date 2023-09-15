import 'dotenv/config'
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { result } from './database/credentials.config';
import { SeedModule } from './seed/seed.module';

@Module({
  
  imports: [
    
    TypeOrmModule.forRoot(result),

    UsersModule,

    CommonModule,

    AuthModule,

    SeedModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
