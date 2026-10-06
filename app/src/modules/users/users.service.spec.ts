// src/modules/users/users.service.spec.ts

import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service.js';
import { UserDao } from './dao/user.dao.js';
import { ProfileDao } from './dao/profile.dao.js';
import { RoleDao } from './dao/role.dao.js';

describe('UsersService', () => {
  let service: UsersService;
  let userDao: any;
  let profileDao: any;
  let roleDao: any;

  beforeEach(async () => {
    userDao = {
      findByEmail: jest.fn(),
      findByIdWithRelations: jest.fn(),
      findById: jest.fn(),
      findPaginated: jest.fn(),
      createInstance: jest.fn((d) => d),
      save: jest.fn((d) => Promise.resolve({ id: 1, ...d })),
      update: jest.fn(),
    };
    profileDao = {
      findByUserId: jest.fn(),
      createInstance: jest.fn((d) => d),
      save: jest.fn((d) => Promise.resolve({ id: 10, ...d })),
    };
    roleDao = {
      findById: jest.fn(),
      findByName: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UserDao, useValue: userDao },
        { provide: ProfileDao, useValue: profileDao },
        { provide: RoleDao, useValue: roleDao },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('debe encontrar usuario por email', async () => {
    userDao.findByEmail.mockResolvedValue({
      id: 1,
      email: 'test@riwicine.com',
    });
    const res = await service.findByEmail('test@riwicine.com');
    expect(res?.email).toBe('test@riwicine.com');
  });

  it('debe arrojar ConflictException si el email ya existe al crear', async () => {
    userDao.findByEmail.mockResolvedValue({ id: 1, email: 'dup@riwicine.com' });
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
    userDao.findByEmail.mockResolvedValueOnce(null); // not existing
    roleDao.findByName.mockResolvedValueOnce({ id: 1, name: 'cliente' }); // default role
    userDao.findByIdWithRelations.mockResolvedValueOnce({
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
    expect(userDao.save).toHaveBeenCalled();
    expect(profileDao.save).toHaveBeenCalled();
  });

  it('debe incrementar intentos fallidos y bloquear cuenta tras 5 intentos', async () => {
    userDao.findById.mockResolvedValue({ id: 1, failedLoginAttempts: 4 });
    await service.recordFailedAttempt(1);

    expect(userDao.save).toHaveBeenCalledWith(
      expect.objectContaining({
        failedLoginAttempts: 5,
        lockedUntil: expect.any(Date),
      }),
    );
  });

  it('debe resetear intentos y actualizar lastLoginAt al iniciar sesión', async () => {
    await service.recordSuccessfulLogin(1);
    expect(userDao.update).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        failedLoginAttempts: 0,
        lockedUntil: null,
      }),
    );
  });
});
