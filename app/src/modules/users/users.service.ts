// src/modules/users/users.service.ts

import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Profile } from './entities/profile.entity.js';
import { Role } from './entities/role.entity.js';
import { User } from './entities/user.entity.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { UserDao } from './dao/user.dao.js';
import { ProfileDao } from './dao/profile.dao.js';
import { RoleDao } from './dao/role.dao.js';
import { UserMapper } from './mappers/user.mapper.js';
import { UserResponseDto } from './dto/user-response.dto.js';

export interface CreateUserData {
  email: string;
  passwordHash: string;
  roleId?: number;
  firstName: string;
  lastName: string;
  documentType: string;
  documentNumber: string;
  birthDate: string;
  phone: string;
  gender?: string | null;
  cityId?: number | null;
  favoriteCinemaId?: number | null;
  personalDataConsent?: boolean;
  termsConsent?: boolean;
  commercialConsent?: boolean;
}

@Injectable()
export class UsersService {
  constructor(
    private readonly userDao: UserDao,
    private readonly profileDao: ProfileDao,
    private readonly roleDao: RoleDao,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userDao.findByEmail(email);
  }

  async findById(id: number): Promise<User | null> {
    return this.userDao.findByIdWithRelations(id);
  }

  async saveUser(user: User): Promise<User> {
    return this.userDao.save(user);
  }

  async findDefaultRole(): Promise<Role> {
    const role = await this.roleDao.findByName('cliente');
    if (!role) {
      throw new NotFoundException({
        statusCode: 404,
        code: 'RESOURCE_NOT_FOUND',
        message: 'Rol por defecto no encontrado en la base de datos',
      });
    }
    return role;
  }

  async createUser(data: CreateUserData): Promise<User> {
    const existing = await this.userDao.findByEmail(data.email);
    if (existing) {
      throw new ConflictException({
        statusCode: 409,
        code: 'RESOURCE_CONFLICT',
        message: 'El correo electrónico ya se encuentra registrado',
      });
    }

    const role = data.roleId
      ? await this.roleDao.findById(data.roleId)
      : await this.findDefaultRole();

    if (!role) {
      throw new BadRequestException({
        statusCode: 400,
        code: 'RESOURCE_NOT_FOUND',
        message: 'Rol especificado no existe',
      });
    }

    const user = this.userDao.createInstance({
      email: data.email,
      passwordHash: data.passwordHash,
      roleId: role.id,
      isActive: true,
      activatedAt: new Date(),
      personalDataConsent: data.personalDataConsent ?? false,
      termsConsent: data.termsConsent ?? false,
      commercialConsent: data.commercialConsent ?? false,
    });

    const savedUser = await this.userDao.save(user);

    const profile = this.profileDao.createInstance({
      userId: savedUser.id,
      firstName: data.firstName,
      lastName: data.lastName,
      documentType: data.documentType,
      documentNumber: data.documentNumber,
      birthDate: data.birthDate,
      phone: data.phone,
      gender: data.gender ?? null,
      cityId: data.cityId ?? null,
      favoriteCinemaId: data.favoriteCinemaId ?? null,
    });

    await this.profileDao.save(profile);

    return (await this.findById(savedUser.id))!;
  }

  async updateProfile(userId: number, dto: UpdateProfileDto): Promise<Profile> {
    let profile = await this.profileDao.findByUserId(userId);
    if (!profile) {
      profile = this.profileDao.createInstance({
        userId,
        firstName: dto.firstName || '',
        lastName: dto.lastName || '',
        documentType: 'CC',
        documentNumber: '',
        birthDate: dto.birthDate || '2000-01-01',
        phone: dto.phone || '',
      });
    }

    Object.assign(profile, dto);
    return this.profileDao.save(profile);
  }

  async findAll(page = 1, limit = 20) {
    const [data, total] = await this.userDao.findPaginated(page, limit);

    const sanitizedData = data.map((u) => this.sanitizeUser(u));

    return {
      data: sanitizedData,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateStatus(
    id: number,
    isActive: boolean,
  ): Promise<Omit<User, 'passwordHash'>> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException({
        statusCode: 404,
        code: 'RESOURCE_NOT_FOUND',
        message: 'Usuario no encontrado',
      });
    }

    user.isActive = isActive;
    await this.userDao.save(user);
    return this.sanitizeUser(user);
  }

  async recordFailedAttempt(userId: number): Promise<void> {
    const user = await this.userDao.findById(userId);
    if (!user) return;

    user.failedLoginAttempts += 1;
    if (user.failedLoginAttempts >= 5) {
      user.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes lockout
    }
    await this.userDao.save(user);
  }

  async recordSuccessfulLogin(userId: number): Promise<void> {
    await this.userDao.update(userId, {
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: new Date(),
    });
  }

  sanitizeUser(user: User): Omit<User, 'passwordHash'> {
    const { passwordHash: _passwordHash, ...safeUser } = user;
    return safeUser;
  }
}
