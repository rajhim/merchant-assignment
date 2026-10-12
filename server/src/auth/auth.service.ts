import { Injectable, UnauthorizedException } from '@nestjs/common';

export interface User {
  id: string;
  username: string;
  name: string;
  role: 'SALES' | 'REVIEWER' | 'ADMIN';
  email?: string;
}

export const MOCK_USERS: (User & { password: string })[] = [
  {
    id: 'sales',
    username: 'sales',
    name: 'Sales Representative 1',
    role: 'SALES',
    password: 'sales'
  },
  {
    id: 'sales2',
    username: 'sales2',
    name: 'Sales Representative 2',
    role: 'SALES',
    password: 'sales2'
  },
  {
    id: 'sales3',
    username: 'sales3',
    name: 'Sales Representative 3',
    role: 'SALES',
    password: 'sales3'
  },
  {
    id: 'reviewer',
    username: 'reviewer',
    name: 'Risk Underwriter 1',
    role: 'REVIEWER',
    password: 'reviewer'
  },
  {
    id: 'reviewer2',
    username: 'reviewer2',
    name: 'Risk Underwriter 2',
    role: 'REVIEWER',
    password: 'reviewer2'
  },
  {
    id: 'reviewer3',
    username: 'reviewer3',
    name: 'Risk Underwriter 3',
    role: 'REVIEWER',
    password: 'reviewer3'
  },
  {
    id: 'admin',
    username: 'admin',
    name: 'Administrator',
    role: 'ADMIN',
    password: 'admin'
  }
];

@Injectable()
export class AuthService {
  login(username: string, password: string): { user: User; accessToken: string; refreshToken: string } {
    const user = MOCK_USERS.find(
      (u) =>
        (u.username.toLowerCase() === username.toLowerCase() ||
         (u.email && u.email.toLowerCase() === username.toLowerCase())) &&
        u.password === password
    );

    if (!user) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const { password: _, ...userSafe } = user;
    const timestamp = Date.now();
    return {
      user: userSafe,
      accessToken: `token_${user.id}_${timestamp}`,
      refreshToken: `refresh_${user.id}_${timestamp}`
    };
  }

  refresh(refreshToken: string): { accessToken: string; refreshToken: string } {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    const sortedUsers = MOCK_USERS.slice().sort((a, b) => b.id.length - a.id.length);
    const matched = sortedUsers.find((u) => refreshToken.includes(u.id)) || MOCK_USERS[0];
    const timestamp = Date.now();
    return {
      accessToken: `token_${matched.id}_${timestamp}`,
      refreshToken: `refresh_${matched.id}_${timestamp}`
    };
  }

  getUsers(): User[] {
    return MOCK_USERS.map(({ password: _, ...user }) => user);
  }

  getUserFromHeader(authHeader?: string): User {
    if (!authHeader) {
      throw new UnauthorizedException('Authentication token required');
    }
    const token = authHeader.replace(/^Bearer\s+/i, '');
    if (token.startsWith('expired') || token === 'invalid') {
      throw new UnauthorizedException('Access token expired');
    }
    const sortedUsers = MOCK_USERS.slice().sort((a, b) => b.id.length - a.id.length);
    const user = sortedUsers.find((u) => token.includes(u.id));
    if (!user) {
      throw new UnauthorizedException('Invalid or expired token');
    }
    return { id: user.id, username: user.username, name: user.name, role: user.role };
  }
}
