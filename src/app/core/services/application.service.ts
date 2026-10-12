import { Injectable, signal } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { BaseApiService } from './base-api.service';
import {
  MerchantApplication,
  ApplicationFilterParams,
  PaginatedResult,
  StatusCounts
} from '../models/application.model';

@Injectable({
  providedIn: 'root'
})
export class ApplicationService extends BaseApiService<MerchantApplication> {
  readonly isSavingDraft = signal<boolean>(false);
  readonly lastSavedTime = signal<Date | null>(null);
  readonly saveError = signal<string | null>(null);

  constructor() {
    super('/api/applications');
  }

  getApplications(filterParams: ApplicationFilterParams): Observable<PaginatedResult<MerchantApplication>> {
    let params = new HttpParams()
      .set('page', filterParams.page.toString())
      .set('pageSize', filterParams.pageSize.toString());

    if (filterParams.search) {
      params = params.set('search', filterParams.search);
    }
    if (filterParams.status && filterParams.status !== 'ALL') {
      params = params.set('status', filterParams.status);
    }
    if (filterParams.businessType && filterParams.businessType !== 'ALL') {
      params = params.set('businessType', filterParams.businessType);
    }

    return this.http.get<PaginatedResult<MerchantApplication>>(this.basePath, { params });
  }

  getApplication(id: string): Observable<MerchantApplication> {
    return this.getById(id);
  }

  createApplication(data: Partial<MerchantApplication>): Observable<MerchantApplication> {
    return this.create(data);
  }

  updateApplication(id: string, data: Partial<MerchantApplication>): Observable<MerchantApplication> {
    return this.update(id, data);
  }

  saveDraft(id: string | null, data: Partial<MerchantApplication>): Observable<MerchantApplication> {
    this.isSavingDraft.set(true);
    this.saveError.set(null);

    const payload = { ...data, status: 'DRAFT' as const };
    const request$ = id
      ? this.updateApplication(id, payload)
      : this.createApplication(payload);

    return request$.pipe(
      tap({
        next: () => {
          this.isSavingDraft.set(false);
          this.lastSavedTime.set(new Date());
        },
        error: (err) => {
          this.isSavingDraft.set(false);
          this.saveError.set(err?.message || 'Failed to auto-save draft');
        }
      })
    );
  }

  recordRiskDecision(
    id: string,
    decision: 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES',
    notes: string
  ): Observable<MerchantApplication> {
    return this.http.post<MerchantApplication>(`${this.basePath}/${id}/risk-decision`, {
      decision,
      notes
    });
  }

  assignReviewer(
    id: string,
    reviewerId: string,
    reviewerName: string
  ): Observable<MerchantApplication> {
    return this.http.post<MerchantApplication>(`${this.basePath}/${id}/assign`, {
      reviewerId,
      reviewerName
    });
  }

  getStatusCounts(): Observable<StatusCounts> {
    return this.http.get<StatusCounts>('/api/status-counts');
  }
}
