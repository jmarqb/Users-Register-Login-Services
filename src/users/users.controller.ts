import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe, UseGuards } from '@nestjs/common';

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleProtected } from '../auth/decorators/role-protected.decorator';
import { ValidRoles } from '../auth/interfaces/valid-roles.enum';
import { UserRoleGuard } from '../auth/guards/user-role.guard';
import { ApiTags,ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiResponse({status:201, description: 'User was created', type:User})
  @ApiResponse({status:400, description: 'Bad Request'})
  @ApiResponse({status:500, description: 'Internal Server Error'})
  create(
    @Body() createUserDto: CreateUserDto): Promise<Omit<User, 'password' | 'isActive'>> {
    return this.usersService.create(createUserDto);
  }

  @ApiResponse({status:200, description: 'Get Users'})
  @Get()
  findAll(@Query() paginationDto:PaginationDto): Promise<PaginatedResult<User>> {
    return this.usersService.findAll(paginationDto);
  }

  @ApiResponse({status:200, description: 'Get User by Id'})
  @ApiResponse({status:404, description: 'User Not Found'})
  @ApiResponse({status:400, description: 'Bad Request'})
  @Get(':id')
  findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findOne(id);
  }

  @ApiBearerAuth()
  @RoleProtected(ValidRoles.admin)
  @UseGuards( JwtAuthGuard, UserRoleGuard)
  @Patch(':id')
  @ApiResponse({status:201, description: 'User was Updated', type:User})
  @ApiResponse({status:400, description: 'Bad Request'})
  @ApiResponse({status:401, description: 'Unauthorized'})
  @ApiResponse({status:403, description: 'Forbidden. Token related'})
  update(@Param('id',ParseUUIDPipe) id: string, @Body() updateUserDto: UpdateUserDto):Promise<User> {
    return this.usersService.update(id, updateUserDto);
  }

  @ApiBearerAuth()
  @RoleProtected(ValidRoles.admin)
  @UseGuards( JwtAuthGuard, UserRoleGuard)
  @Delete(':id')
  @ApiResponse({status:201, description: 'User was Deleted', type:User})
  @ApiResponse({status:400, description: 'Bad Request'})
  @ApiResponse({status:401, description: 'Unauthorized'})
  @ApiResponse({status:403, description: 'Forbidden. Token related'})
  remove(@Param('id',ParseUUIDPipe) id: string) {
    return this.usersService.remove(id);
  }
}
