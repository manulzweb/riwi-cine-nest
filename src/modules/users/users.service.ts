// src/modules/users/users.service.ts

import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from './entities/profile.entity';
import { Role } from './entities/role.entity';
import { User } from './entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';

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
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Profile)
    private readonly profileRepo: Repository<Profile>,
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({
      where: { email },
      relations: ['role', 'profile'],
    });
  }

  async findById(id: number): Promise<User | null> {
    return this.userRepo.findOne({
      where: { id },
      relations: ['role', 'profile'],
    });
  }

  async findDefaultRole(): Promise<Role> {
    const role = await this.roleRepo.findOne({ where: { name: 'cliente' } });
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
    const existing = await this.userRepo.findOne({
      where: { email: data.email },
    });
    if (existing) {
      throw new ConflictException({
        statusCode: 409,
        code: 'RESOURCE_CONFLICT',
        message: 'El correo electrónico ya se encuentra registrado',
      });
    }

    const role = data.roleId
      ? await this.roleRepo.findOne({ where: { id: data.roleId } })
      : await this.findDefaultRole();

    if (!role) {
      throw new BadRequestException({
        statusCode: 400,
        code: 'RESOURCE_NOT_FOUND',
        message: 'Rol especificado no existe',
      });
    }

    const user = this.userRepo.create({
      email: data.email,
      passwordHash: data.passwordHash,
      roleId: role.id,
      isActive: true, // Default to true or activated upon registration/verification
      activatedAt: new Date(),
      personalDataConsent: data.personalDataConsent ?? false,
      termsConsent: data.termsConsent ?? false,
      commercialConsent: data.commercialConsent ?? false,
    });

    const savedUser = await this.userRepo.save(user);

    const profile = this.profileRepo.create({
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

    await this.profileRepo.save(profile);

    return (await this.findById(savedUser.id))!;
  }

  async updateProfile(userId: number, dto: UpdateProfileDto): Promise<Profile> {
    let profile = await this.profileRepo.findOne({ where: { userId } });
    if (!profile) {
      profile = this.profileRepo.create({
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
    return this.profileRepo.save(profile);
  }

  async findAll(page = 1, limit = 20) {
    const [data, total] = await this.userRepo.findAndCount({
      relations: ['role', 'profile'],
      order: { id: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

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
    await this.userRepo.save(user);
    return this.sanitizeUser(user);
  }

  async recordFailedAttempt(userId: number): Promise<void> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) return;

    user.failedLoginAttempts += 1;
    if (user.failedLoginAttempts >= 5) {
      user.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes lockout
    }
    await this.userRepo.save(user);
  }

  async recordSuccessfulLogin(userId: number): Promise<void> {
    await this.userRepo.update(userId, {
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
