import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { User, UserRole, AuthTokens } from '../models/user.model';

export interface PresetUser extends User {
  defaultPassword?: string;
}

export const PRESET_USERS: PresetUser[] = [
  {
    id: 'sales',
    username: 'sales',
    name: 'Sales Representative 1',
    role: 'SALES',
    defaultPassword: 'sales'
  },
  {
    id: 'sales2',
    username: 'sales2',
    name: 'Sales Representative 2',
    role: 'SALES',
    defaultPassword: 'sales2'
  },
  {
    id: 'sales3',
    username: 'sales3',
    name: 'Sales Representative 3',
    role: 'SALES',
    defaultPassword: 'sales3'
  },
  {
    id: 'reviewer',
    username: 'reviewer',
    name: 'Risk Underwriter 1',
    role: 'REVIEWER',
    defaultPassword: 'reviewer'
  },
  {
    id: 'reviewer2',
    username: 'reviewer2',
    name: 'Risk Underwriter 2',
    role: 'REVIEWER',
    defaultPassword: 'reviewer2'
  },
  {
    id: 'reviewer3',
    username: 'reviewer3',
    name: 'Risk Underwriter 3',
    role: 'REVIEWER',
    defaultPassword: 'reviewer3'
  },
  {
    id: 'admin',
    username: 'admin',
    name: 'Administrator',
    role: 'ADMIN',
    defaultPassword: 'admin'
  }
];

export const ROLE_USERS: Record<UserRole, User> = {
  SALES: PRESET_USERS[0],
  REVIEWER: PRESET_USERS[3],
  ADMIN: PRESET_USERS[6]
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  readonly currentUser = signal<User>(this.getStoredUser());
  readonly tokens = signal<AuthTokens>(this.getStoredTokens());

  readonly userRole = computed(() => this.currentUser().role);
  readonly isAuthenticated = computed(() => !!this.tokens().accessToken);

  private getStoredTokens(): AuthTokens {
    try {
      const stored = sessionStorage.getItem('portal_tokens');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.accessToken) return parsed;
      }
    } catch (e) {}
    return {
      accessToken: 'valid_access_token_sales',
      refreshToken: 'valid_refresh_token_sales'
    };
  }

  private getStoredUser(): User {
    try {
      const stored = sessionStorage.getItem('portal_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.id) return parsed;
      }
    } catch (e) {}
    return PRESET_USERS[0];
  }

  private persistSession(user: User, tokens: AuthTokens): void {
    try {
      sessionStorage.setItem('portal_user', JSON.stringify(user));
      sessionStorage.setItem('portal_tokens', JSON.stringify(tokens));
    } catch (e) {}
  }

  private clearSession(): void {
    try {
      sessionStorage.removeItem('portal_user');
      sessionStorage.removeItem('portal_tokens');
      localStorage.removeItem('portal_user');
      localStorage.removeItem('portal_tokens');
    } catch (e) {}
  }

  getAccessToken(): string | null {
    return this.tokens().accessToken || null;
  }

  getRefreshToken(): string | null {
    return this.tokens().refreshToken || null;
  }

  setTokens(tokens: AuthTokens): void {
    this.tokens.set(tokens);
  }

  login(username: string, password: string): Observable<{ user: User; accessToken: string; refreshToken: string }> {
    return this.http.post<{ user: User; accessToken: string; refreshToken: string }>('/api/auth/login', {
      username,
      password
    }).pipe(
      tap((res) => {
        const tokenObj = {
          accessToken: res.accessToken,
          refreshToken: res.refreshToken
        };
        this.setTokens(tokenObj);
        this.currentUser.set(res.user);
        this.persistSession(res.user, tokenObj);
      })
    );
  }

  logout(): void {
    this.tokens.set({
      accessToken: '',
      refreshToken: ''
    });
    this.currentUser.set(PRESET_USERS[0]);
    this.clearSession();
    this.router.navigate(['/login']);
  }

  switchUserById(userId: string): void {
    const user = PRESET_USERS.find((u) => u.id === userId) || PRESET_USERS[0];
    const tokens = {
      accessToken: `valid_access_token_${user.id}`,
      refreshToken: `valid_refresh_token_${user.id}`
    };
    this.tokens.set(tokens);
    this.currentUser.set(user);
    this.persistSession(user, tokens);
  }

  switchUserRole(role: UserRole): void {
    const user = ROLE_USERS[role];
    const tokens = {
      accessToken: `valid_access_token_${user.id}`,
      refreshToken: `valid_refresh_token_${user.id}`
    };
    this.tokens.set(tokens);
    this.currentUser.set(user);
    this.persistSession(user, tokens);
  }

  hasRole(roles: UserRole[]): boolean {
    return roles.includes(this.currentUser().role);
  }

  refreshToken(): Observable<{ accessToken: string; refreshToken: string }> {
    return this.http.post<{ accessToken: string; refreshToken: string }>('/api/auth/refresh', {
      refreshToken: this.getRefreshToken()
    }).pipe(
      tap((res) => {
        this.setTokens({
          accessToken: res.accessToken,
          refreshToken: res.refreshToken
        });
      })
    );
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>('/api/auth/users');
  }
}
