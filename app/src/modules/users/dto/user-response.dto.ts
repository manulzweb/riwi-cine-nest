export class ProfileResponseDto {
  id: number;
  firstName: string;
  lastName: string;
  documentType: string;
  documentNumber: string;
  phone: string;
  birthDate: string;
  gender: string | null;
  cityId: number | null;
  favoriteCinemaId: number | null;
}

export class UserResponseDto {
  id: number;
  email: string;
  roleId: number | null;
  roleName?: string;
  isActive: boolean;
  status: string;
  emailVerified: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  profile?: ProfileResponseDto;
}
