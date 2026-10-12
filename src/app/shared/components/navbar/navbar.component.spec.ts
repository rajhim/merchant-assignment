import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { NavbarComponent } from './navbar.component';
import { AuthService } from '../../../core/services/auth.service';
import { ApplicationService } from '../../../core/services/application.service';
import { of } from 'rxjs';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let authService: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarComponent],
      providers: [
        provideRouter([]),
        provideHttpClient()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should switch role on role change event', () => {
    const mockEvent = {
      target: { value: 'REVIEWER' }
    } as unknown as Event;

    component.onRoleChange(mockEvent);
    expect(authService.userRole()).toBe('REVIEWER');
  });

  it('should invalidate token and fire concurrent requests when simulating 401', () => {
    const appService = TestBed.inject(ApplicationService);
    vi.spyOn(appService, 'getApplications').mockReturnValue(of({ data: [], total: 0, page: 1, pageSize: 5, totalPages: 1 }));
    vi.spyOn(appService, 'getStatusCounts').mockReturnValue(of({ total: 0, draft: 0, submitted: 0, underReview: 0, approved: 0, rejected: 0 }));

    component.simulateConcurrent401();
    expect(authService.getAccessToken()).toBe('expired_token');
    expect(appService.getApplications).toHaveBeenCalled();
    expect(appService.getStatusCounts).toHaveBeenCalled();
  });
});
