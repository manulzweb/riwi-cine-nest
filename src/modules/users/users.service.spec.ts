// src/modules/users/users.service.spec.ts

import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Profile } from './entities/profile.entity';
import { Role } from './entities/role.entity';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let userRepo: any;
  let profileRepo: any;
  let roleRepo: any;

  beforeEach(async () => {
    userRepo = {
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      create: jest.fn((d) => d),
      save: jest.fn((d) => Promise.resolve({ id: 1, ...d })),
      update: jest.fn(),
    };
    profileRepo = {
      findOne: jest.fn(),
      create: jest.fn((d) => d),
      save: jest.fn((d) => Promise.resolve({ id: 10, ...d })),
    };
    roleRepo = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: getRepositoryToken(Profile), useValue: profileRepo },
        { provide: getRepositoryToken(Role), useValue: roleRepo },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('debe encontrar usuario por email', async () => {
    userRepo.findOne.mockResolvedValue({ id: 1, email: 'test@riwicine.com' });
    const res = await service.findByEmail('test@riwicine.com');
    expect(res?.email).toBe('test@riwicine.com');
  });

  it('debe arrojar ConflictException si el email ya existe al crear', async () => {
    userRepo.findOne.mockResolvedValue({ id: 1, email: 'dup@riwicine.com' });
    await expect(
      service.createUser({
        email: 'dup@riwicine.com',
        passwordHash: 'hash',
        firstName: 'A',
        lastName: 'B',
        documentType: 'CC',
        documentNumber: '123',
        birthDate: '1990-01-01',
        phone: '123',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('debe crear usuario y perfil exitosamente con rol por defecto', async () => {
    userRepo.findOne.mockResolvedValueOnce(null); // not existing
    roleRepo.findOne.mockResolvedValueOnce({ id: 1, name: 'cliente' }); // default role
    userRepo.findOne.mockResolvedValueOnce({
      id: 1,
      email: 'new@riwicine.com',
      role: { name: 'cliente' },
    }); // after save findById

    const res = await service.createUser({
      email: 'new@riwicine.com',
      passwordHash: 'hashed_pw',
      firstName: 'Carlos',
      lastName: 'Gómez',
      documentType: 'CC',
      documentNumber: '998877',
      birthDate: '1995-10-10',
      phone: '3000000000',
    });

    expect(res).toBeDefined();
    expect(userRepo.save).toHaveBeenCalled();
    expect(profileRepo.save).toHaveBeenCalled();
  });

  it('debe incrementar intentos fallidos y bloquear cuenta tras 5 intentos', async () => {
    userRepo.findOne.mockResolvedValue({ id: 1, failedLoginAttempts: 4 });
    await service.recordFailedAttempt(1);

    expect(userRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        failedLoginAttempts: 5,
        lockedUntil: expect.any(Date),
      }),
    );
  });

  it('debe resetear intentos y actualizar lastLoginAt al iniciar sesión', async () => {
    await service.recordSuccessfulLogin(1);
    expect(userRepo.update).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        failedLoginAttempts: 0,
        lockedUntil: null,
      }),
    );
  });
});
