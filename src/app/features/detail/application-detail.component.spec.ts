import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { ApplicationDetailComponent } from './application-detail.component';
import { ApplicationService } from '../../core/services/application.service';
import { AuthService } from '../../core/services/auth.service';
import { of } from 'rxjs';

describe('ApplicationDetailComponent', () => {
  let component: ApplicationDetailComponent;
  let authService: AuthService;
  let appService: ApplicationService;

  const mockApp = {
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
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplicationDetailComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => (key === 'id' ? 'APP-1001' : null)
              }
            }
          }
        }
      ]
    }).compileComponents();

    authService = TestBed.inject(AuthService);
    appService = TestBed.inject(ApplicationService);
    vi.spyOn(appService, 'getApplication').mockReturnValue(of(mockApp));

    const fixture = TestBed.createComponent(ApplicationDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should load application and keep sensitive fields masked by default', () => {
    expect(component.application()?.id).toBe('APP-1001');
    expect(component.revealedTaxId()).toBe(false);
    expect(component.revealedBankAccount()).toBe(false);
  });

  it('should prevent SALES role from revealing sensitive fields', () => {
    authService.switchUserRole('SALES');
    expect(component.canRevealSensitive()).toBe(false);

    component.toggleTaxId();
    expect(component.revealedTaxId()).toBe(false);
  });

  it('should permit REVIEWER role to reveal sensitive fields and record audit', () => {
    authService.switchUserRole('REVIEWER');
    expect(component.canRevealSensitive()).toBe(true);

    component.toggleTaxId();
    expect(component.revealedTaxId()).toBe(true);
    expect(component.auditLog().length).toBe(1);
  });

  it('should record risk decision when submitted with notes', () => {
    authService.switchUserRole('REVIEWER');
    vi.spyOn(appService, 'recordRiskDecision').mockReturnValue(
      of({ ...mockApp, status: 'APPROVED' })
    );

    component.decisionType = 'APPROVE';
    component.decisionNotes = 'All checks pass';
    component.submitRiskDecision();

    expect(appService.recordRiskDecision).toHaveBeenCalledWith(
      'APP-1001',
      'APPROVE',
      'All checks pass'
    );
    expect(component.application()?.status).toBe('APPROVED');
  });

  it('should verify reviewer decision controls are hidden from SALES users', () => {
    authService.switchUserRole('SALES');
    expect(authService.hasRole(['REVIEWER', 'ADMIN'])).toBe(false);

    authService.switchUserRole('REVIEWER');
    expect(authService.hasRole(['REVIEWER', 'ADMIN'])).toBe(true);

    authService.switchUserRole('ADMIN');
    expect(authService.hasRole(['REVIEWER', 'ADMIN'])).toBe(true);
  });

  it('should open and close risk decision modal', () => {
    expect(component.showRiskDecisionModal).toBe(false);
    component.openRiskDecisionModal();
    expect(component.showRiskDecisionModal).toBe(true);
    component.closeRiskDecisionModal();
    expect(component.showRiskDecisionModal).toBe(false);
  });

  it('should verify canReviewApplication respects assignment and role permissions', () => {
    authService.switchUserRole('SALES');
    expect(component.canReviewApplication()).toBe(false);

    authService.switchUserRole('ADMIN');
    expect(component.canReviewApplication()).toBe(true);

    authService.switchUserRole('REVIEWER');
    expect(component.canReviewApplication()).toBe(true);

    component.application.set({ ...mockApp, assignedReviewerId: 'other_reviewer' });
    expect(component.canReviewApplication()).toBe(false);
  });

  it('should prevent REVIEWER from reviewing once decision is submitted, but allow ADMIN', () => {
    authService.switchUserRole('REVIEWER');
    component.application.set({
      ...mockApp,
      status: 'APPROVED',
      riskHistory: [
        {
          id: 'RSK-1',
          decision: 'APPROVE',
          notes: 'Approved',
          reviewerId: 'reviewer',
          reviewerName: 'reviewer',
          decidedAt: '2026-03-22T14:45:00Z'
        }
      ]
    });

    expect(component.canReviewApplication()).toBe(false);

    component.openRiskDecisionModal();
    expect(component.showRiskDecisionModal).toBe(false);

    authService.switchUserRole('ADMIN');
    expect(component.canReviewApplication()).toBe(true);

    component.openRiskDecisionModal();
    expect(component.showRiskDecisionModal).toBe(true);
  });

  it('should show notification and record audit when assigning reviewer', () => {
    vi.spyOn(appService, 'assignReviewer').mockReturnValue(
      of({ ...mockApp, assignedReviewerId: 'reviewer2', assignedReviewerName: 'Risk Underwriter 2' })
    );

    component.selectedAssigneeId = 'reviewer2';
    component.assignReviewer();

    expect(appService.assignReviewer).toHaveBeenCalledWith(
      'APP-1001',
      'reviewer2',
      'Risk Underwriter 2'
    );
    expect(component.assignmentNotification()).toContain('Risk Underwriter 2');
    expect(component.isAssigning()).toBe(false);
    expect(component.application()?.assignedReviewerId).toBe('reviewer2');
  });

  it('should dismiss assignment notification', () => {
    component.assignmentNotification.set('Assigned successfully');
    component.dismissAssignmentNotification();
    expect(component.assignmentNotification()).toBeNull();
  });
});
