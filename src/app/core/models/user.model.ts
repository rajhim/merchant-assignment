export type UserRole = 'SALES' | 'REVIEWER' | 'ADMIN';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  email?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
