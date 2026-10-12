import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { AuthService, ROLE_USERS } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideRouter([{ path: 'login', children: [] }]),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should initialize with default SALES user and tokens', () => {
    expect(service.currentUser()).toEqual(ROLE_USERS.SALES);
    expect(service.userRole()).toBe('SALES');
    expect(service.isAuthenticated()).toBe(true);
    expect(service.getAccessToken()).toBe('valid_access_token_sales');
    expect(service.getRefreshToken()).toBe('valid_refresh_token_sales');
  });

  it('should switch user role accurately', () => {
    service.switchUserRole('REVIEWER');
    expect(service.currentUser()).toEqual(ROLE_USERS.REVIEWER);
    expect(service.userRole()).toBe('REVIEWER');
    expect(service.getAccessToken()).toBe('valid_access_token_reviewer');

    service.switchUserRole('ADMIN');
    expect(service.currentUser()).toEqual(ROLE_USERS.ADMIN);
    expect(service.userRole()).toBe('ADMIN');
    expect(service.getAccessToken()).toBe('valid_access_token_admin');
  });

  it('should verify roles correctly with hasRole', () => {
    service.switchUserRole('SALES');
    expect(service.hasRole(['SALES'])).toBe(true);
    expect(service.hasRole(['REVIEWER', 'ADMIN'])).toBe(false);

    service.switchUserRole('REVIEWER');
    expect(service.hasRole(['REVIEWER', 'ADMIN'])).toBe(true);
    expect(service.hasRole(['SALES'])).toBe(false);
  });

  it('should refresh tokens via API endpoint', () => {
    service.refreshToken().subscribe((res) => {
      expect(res.accessToken).toBe('new_access_token');
      expect(res.refreshToken).toBe('new_refresh_token');
      expect(service.getAccessToken()).toBe('new_access_token');
    });

    const req = httpMock.expectOne('/api/auth/refresh');
    expect(req.request.method).toBe('POST');
    req.flush({
      accessToken: 'new_access_token',
      refreshToken: 'new_refresh_token'
    });
  });

  it('should login via API endpoint and update state', () => {
    service.login('reviewer', 'reviewer').subscribe((res) => {
      expect(res.user.role).toBe('REVIEWER');
      expect(service.userRole()).toBe('REVIEWER');
    });

    const req = httpMock.expectOne('/api/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush({
      user: { id: 'reviewer', username: 'reviewer', name: 'reviewer', role: 'REVIEWER' },
      accessToken: 'token_123',
      refreshToken: 'refresh_123'
    });
  });

  it('should logout and clear state', () => {
    service.logout();
    expect(service.isAuthenticated()).toBe(false);
  });

  it('should fetch users list from API endpoint', () => {
    service.getUsers().subscribe((users) => {
      expect(users.length).toBe(3);
      expect(users[0].username).toBe('sales');
    });

    const req = httpMock.expectOne('/api/auth/users');
    expect(req.request.method).toBe('GET');
    req.flush([
      { id: 'sales', username: 'sales', name: 'sales', role: 'SALES' },
      { id: 'reviewer', username: 'reviewer', name: 'reviewer', role: 'REVIEWER' },
      { id: 'admin', username: 'admin', name: 'admin', role: 'ADMIN' }
    ]);
  });
});
