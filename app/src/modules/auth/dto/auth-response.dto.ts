export class AuthResponseDto {
  user: {
    id: number;
    email: string;
    role: string;
    isActive: boolean;
  };
  accessToken: string;
  refreshToken?: string;
  csrfToken?: string;
}
