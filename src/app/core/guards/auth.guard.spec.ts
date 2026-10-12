import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('authGuard', () => {
  let authService: AuthService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient()
      ]
    });

    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  it('should allow access when user is authenticated', () => {
    authService.setTokens({ accessToken: 'valid_token', refreshToken: 'refresh_token' });
    const route = {} as ActivatedRouteSnapshot;
    const result = TestBed.runInInjectionContext(() => authGuard(route, {} as any));
    expect(result).toBe(true);
  });

  it('should deny access and redirect to root when unauthenticated', () => {
    authService.setTokens({ accessToken: '', refreshToken: '' });
    const route = {} as ActivatedRouteSnapshot;
    const result = TestBed.runInInjectionContext(() => authGuard(route, {} as any));
    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
