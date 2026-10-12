import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { ApplicationService } from '../../core/services/application.service';
import { of } from 'rxjs';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let appService: ApplicationService;

  const mockPaginated = {
    data: [
      {
        id: 'APP-1001',
        businessName: 'Dummy Application 1001',
        tradingName: 'Dummy Store 1001',
        businessType: 'LLC' as const,
        taxId: '12-3456780',
        registrationNumber: 'REG-99200',
        websiteUrl: 'https://dummy1001.internal',
        contactName: 'Dummy Contact 1001',
        contactEmail: 'dummy1001@dummy.internal',
        contactPhone: '(555) 019-1001',
        contactTitle: 'Dummy Officer',
        bankName: 'Dummy Bank',
        bankAccountNumber: '98765432101001',
        routingNumber: '121000358',
        accountType: 'CHECKING' as const,
        monthlyVolume: 450000,
        averageTicketSize: 125,
        currency: 'USD',
        status: 'UNDER_REVIEW' as const,
        createdBySalesId: 'sales',
        createdByName: 'sales',
        assignedReviewerId: 'reviewer',
        assignedReviewerName: 'reviewer',
        riskHistory: [],
        createdAt: '2026-03-18T08:30:00Z',
        updatedAt: '2026-03-20T10:15:00Z'
      }
    ],
    total: 1,
    page: 1,
    pageSize: 10,
    totalPages: 1
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({})
          }
        }
      ]
    }).compileComponents();

    appService = TestBed.inject(ApplicationService);
    vi.spyOn(appService, 'getApplications').mockReturnValue(of(mockPaginated));
    vi.spyOn(appService, 'getStatusCounts').mockReturnValue(
      of({ total: 1, draft: 0, submitted: 0, underReview: 1, approved: 0, rejected: 0 })
    );

    const fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should load applications and status counts on init', () => {
    expect(component.applications().length).toBe(1);
    expect(component.statusCounts()?.total).toBe(1);
    expect(component.isLoading()).toBe(false);
  });

  it('should update status filter and reload', () => {
    component.onStatusChange('APPROVED');
    expect(component.statusFilter()).toBe('APPROVED');
    expect(component.page()).toBe(1);
    expect(appService.getApplications).toHaveBeenCalled();
  });

  it('should change page', () => {
    component.totalPages.set(3);
    component.goToPage(2);
    expect(component.page()).toBe(2);
    expect(appService.getApplications).toHaveBeenCalled();
  });

  it('should update businessType filter and reload', () => {
    component.onBusinessTypeChange('CORPORATION');
    expect(component.businessTypeFilter()).toBe('CORPORATION');
    expect(component.page()).toBe(1);
    expect(appService.getApplications).toHaveBeenCalled();
  });

  it('should update page size and reset to page 1', () => {
    component.page.set(3);
    component.onPageSizeChange(10);
    expect(component.pageSize()).toBe(10);
    expect(component.page()).toBe(1);
    expect(appService.getApplications).toHaveBeenCalled();
  });

  it('should reload data when retry is invoked', () => {
    component.retry();
    expect(appService.getApplications).toHaveBeenCalled();
    expect(appService.getStatusCounts).toHaveBeenCalled();
  });

  it('should assign reviewer and trigger notification via onAssignReviewer', () => {
    const targetApp = mockPaginated.data[0];
    vi.spyOn(appService, 'assignReviewer').mockReturnValue(
      of({ ...targetApp, assignedReviewerId: 'reviewer2', assignedReviewerName: 'Risk Underwriter 2' })
    );

    component.onAssignReviewer(targetApp as any, 'reviewer2');

    expect(appService.assignReviewer).toHaveBeenCalledWith(
      'APP-1001',
      'reviewer2',
      'Risk Underwriter 2'
    );
    expect(component.assigningAppId()).toBeNull();
  });
});
