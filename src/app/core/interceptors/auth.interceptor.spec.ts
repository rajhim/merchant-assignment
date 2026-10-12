import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { authInterceptor, resetInterceptorState } from './auth.interceptor';
import { AuthService } from '../services/auth.service';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let authService: AuthService;

  beforeEach(() => {
    resetInterceptorState();

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting()
      ]
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should attach bearer token to outgoing requests', () => {
    authService.setTokens({
      accessToken: 'test_token_123',
      refreshToken: 'test_refresh_123'
    });

    http.get('/api/test-data').subscribe();

    const req = httpMock.expectOne('/api/test-data');
    expect(req.request.headers.get('Authorization')).toBe('Bearer test_token_123');
    req.flush({ success: true });
  });

  it('should refresh token only once when concurrent requests receive 401', () => {
    authService.setTokens({
      accessToken: 'expired_token',
      refreshToken: 'valid_refresh'
    });

    const results: any[] = [];

    http.get('/api/resource-1').subscribe((res) => results.push(res));
    http.get('/api/resource-2').subscribe((res) => results.push(res));
    http.get('/api/resource-3').subscribe((res) => results.push(res));

    const req1 = httpMock.expectOne('/api/resource-1');
    const req2 = httpMock.expectOne('/api/resource-2');
    const req3 = httpMock.expectOne('/api/resource-3');

    req1.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });
    req2.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });
    req3.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

    const refreshReq = httpMock.expectOne('/api/auth/refresh');
    expect(refreshReq.request.method).toBe('POST');
    refreshReq.flush({
      accessToken: 'new_refreshed_token',
      refreshToken: 'new_refresh_token'
    });

    const retry1 = httpMock.expectOne('/api/resource-1');
    const retry2 = httpMock.expectOne('/api/resource-2');
    const retry3 = httpMock.expectOne('/api/resource-3');

    expect(retry1.request.headers.get('Authorization')).toBe('Bearer new_refreshed_token');
    expect(retry2.request.headers.get('Authorization')).toBe('Bearer new_refreshed_token');
    expect(retry3.request.headers.get('Authorization')).toBe('Bearer new_refreshed_token');

    retry1.flush({ id: 1 });
    retry2.flush({ id: 2 });
    retry3.flush({ id: 3 });

    expect(results.length).toBe(3);
    expect(results).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
  });
});
