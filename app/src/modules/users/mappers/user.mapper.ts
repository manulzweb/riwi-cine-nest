import { User } from '../entities/user.entity.js';
import {
  UserResponseDto,
  ProfileResponseDto,
} from '../dto/user-response.dto.js';
import { Profile } from '../entities/profile.entity.js';

export class UserMapper {
  static toResponseDto(entity: User): UserResponseDto {
    return {
      id: entity.id,
      email: entity.email,
      roleId: entity.roleId,
      roleName: entity.role?.name,
      isActive: entity.isActive,
      status: entity.isActive ? 'active' : 'inactive',
      emailVerified: !!entity.emailVerifiedAt,
      lastLoginAt: entity.lastLoginAt,
      createdAt: entity.createdAt,
      profile: entity.profile
        ? this.toProfileResponseDto(entity.profile)
        : undefined,
    };
  }

  static toProfileResponseDto(profile: Profile): ProfileResponseDto {
    return {
      id: profile.id,
      firstName: profile.firstName,
      lastName: profile.lastName,
      documentType: profile.documentType,
      documentNumber: profile.documentNumber,
      phone: profile.phone,
      birthDate: profile.birthDate,
      gender: profile.gender,
      cityId: profile.cityId,
      favoriteCinemaId: profile.favoriteCinemaId,
    };
  }

  static toResponseDtoList(entities: User[]): UserResponseDto[] {
    return entities.map((u) => this.toResponseDto(u));
  }
}
