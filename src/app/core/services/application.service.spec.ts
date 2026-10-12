import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ApplicationService } from './application.service';

describe('ApplicationService', () => {
  let service: ApplicationService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ApplicationService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(ApplicationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should query applications with pagination and filters', () => {
    service.getApplications({
      page: 2,
      pageSize: 5,
      search: 'Acme',
      status: 'APPROVED',
      businessType: 'LLC'
    }).subscribe((res) => {
      expect(res.data.length).toBe(1);
      expect(res.total).toBe(1);
    });

    const req = httpMock.expectOne((r) => r.url === '/api/applications');
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('pageSize')).toBe('5');
    expect(req.request.params.get('search')).toBe('Acme');
    expect(req.request.params.get('status')).toBe('APPROVED');
    expect(req.request.params.get('businessType')).toBe('LLC');

    req.flush({
      data: [{ id: 'APP-1', businessName: 'Acme Inc' }],
      total: 1,
      page: 2,
      pageSize: 5,
      totalPages: 1
    });
  });

  it('should save draft and update lastSavedTime signal', () => {
    expect(service.lastSavedTime()).toBeNull();

    service.saveDraft('APP-100', { businessName: 'Draft Co' }).subscribe((app) => {
      expect(app.id).toBe('APP-100');
    });

    const req = httpMock.expectOne('/api/applications/APP-100');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body.status).toBe('DRAFT');

    req.flush({ id: 'APP-100', businessName: 'Draft Co', status: 'DRAFT' });

    expect(service.lastSavedTime()).not.toBeNull();
    expect(service.isSavingDraft()).toBe(false);
  });

  it('should record risk decision', () => {
    service.recordRiskDecision('APP-100', 'APPROVE', 'Clear KYC').subscribe();

    const req = httpMock.expectOne('/api/applications/APP-100/risk-decision');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      decision: 'APPROVE',
      notes: 'Clear KYC'
    });

    req.flush({ id: 'APP-100', status: 'APPROVED' });
  });
});
