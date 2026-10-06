// src/modules/users/users.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile } from './entities/profile.entity.js';
import { Role } from './entities/role.entity.js';
import { User } from './entities/user.entity.js';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';
import { UserDao } from './dao/user.dao.js';
import { ProfileDao } from './dao/profile.dao.js';
import { RoleDao } from './dao/role.dao.js';
import { UserMapper } from './mappers/user.mapper.js';

@Module({
  imports: [TypeOrmModule.forFeature([User, Profile, Role])],
  controllers: [UsersController],
  providers: [UsersService, UserDao, ProfileDao, RoleDao, UserMapper],
  exports: [UsersService, UserDao, ProfileDao, RoleDao, UserMapper],
})
export class UsersModule {}
