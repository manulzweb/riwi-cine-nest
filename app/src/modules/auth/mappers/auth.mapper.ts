import { User } from '../../users/entities/user.entity.js';
import { AuthResponseDto } from '../dto/auth-response.dto.js';

export class AuthMapper {
  static toResponseDto(
    user: User,
    accessToken: string,
    refreshToken?: string,
    csrfToken?: string,
  ): AuthResponseDto {
    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role?.name || 'cliente',
        isActive: user.isActive,
      },
      accessToken,
      refreshToken,
      csrfToken,
    };
  }
}
