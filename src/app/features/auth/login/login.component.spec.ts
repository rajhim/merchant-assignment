import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService, PRESET_USERS } from '../../../core/services/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideHttpClient(),
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should validate form fields', () => {
    component.loginForm.patchValue({ username: '', password: '' });
    expect(component.loginForm.valid).toBe(false);

    component.loginForm.patchValue({ username: 'sales', password: 'sales' });
    expect(component.loginForm.valid).toBe(true);
  });

  it('should submit login credentials', () => {
    vi.spyOn(authService, 'login').mockReturnValue(
      of({
        user: PRESET_USERS[0],
        accessToken: 'token_123',
        refreshToken: 'refresh_123'
      })
    );

    component.loginForm.patchValue({
      username: 'sales',
      password: 'sales'
    });
    component.onSubmit();

    expect(authService.login).toHaveBeenCalledWith('sales', 'sales');
    expect(component.isLoading()).toBe(false);
  });

  it('should handle login error', () => {
    vi.spyOn(authService, 'login').mockReturnValue(
      throwError(() => ({ error: { message: 'Invalid username or password' } }))
    );

    component.loginForm.patchValue({
      username: 'unknown',
      password: 'wrongpassword'
    });
    component.onSubmit();

    expect(component.errorMessage()).toBe('Invalid username or password');
    expect(component.isLoading()).toBe(false);
  });

  it('should select preset and trigger login', () => {
    vi.spyOn(authService, 'login').mockReturnValue(
      of({
        user: PRESET_USERS[1],
        accessToken: 'token_reviewer',
        refreshToken: 'refresh_reviewer'
      })
    );

    component.selectPreset(PRESET_USERS[1]);

    expect(component.loginForm.value.username).toBe(PRESET_USERS[1].username);
    expect(authService.login).toHaveBeenCalled();
  });
});
