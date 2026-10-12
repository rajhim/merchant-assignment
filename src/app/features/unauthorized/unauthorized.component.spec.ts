import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { UnauthorizedComponent } from './unauthorized.component';
import { AuthService } from '../../core/services/auth.service';

describe('UnauthorizedComponent', () => {
  let component: UnauthorizedComponent;
  let fixture: ComponentFixture<UnauthorizedComponent>;
  let authService: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnauthorizedComponent],
      providers: [
        provideHttpClient(),
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UnauthorizedComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    fixture.detectChanges();
  });

  it('should create component and inherit authService from BaseComponent', () => {
    expect(component).toBeTruthy();
    expect(component.authService).toBeTruthy();
    expect(component.authService.userRole()).toBe('SALES');
  });

  it('should reflect updated role in template when role changes', () => {
    authService.switchUserRole('REVIEWER');
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('REVIEWER');
  });
});
