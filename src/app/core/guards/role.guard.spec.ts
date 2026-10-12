import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { roleGuard } from './role.guard';
import { AuthService } from '../services/auth.service';

describe('roleGuard', () => {
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

  it('should allow access if user has permitted role', () => {
    authService.switchUserRole('SALES');

    const route = {
      data: { roles: ['SALES', 'ADMIN'] }
    } as unknown as ActivatedRouteSnapshot;

    const result = TestBed.runInInjectionContext(() => roleGuard(route, {} as any));
    expect(result).toBe(true);
  });

  it('should deny access and redirect to /unauthorized if user does not have permitted role', () => {
    authService.switchUserRole('SALES');

    const route = {
      data: { roles: ['REVIEWER'] }
    } as unknown as ActivatedRouteSnapshot;

    const result = TestBed.runInInjectionContext(() => roleGuard(route, {} as any));
    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/unauthorized']);
  });
});
