import { Component, OnInit, signal, effect, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { BaseComponent } from '../../core/base/base.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { StatusUpdateEvent } from '../../core/services/realtime.service';
import {
  MerchantApplication,
  ApplicationStatus,
  StatusCounts
} from '../../core/models/application.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PaginationComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent extends BaseComponent implements OnInit {
  applications = signal<MerchantApplication[]>([]);
  statusCounts = signal<StatusCounts | null>(null);
  isLoading = signal<boolean>(false);
  hasError = signal<boolean>(false);
  errorMessage = signal<string>('');
  
  page = signal<number>(1);
  pageSize = signal<number>(5);
  totalPages = signal<number>(1);
  totalCount = signal<number>(0);
  
  searchQuery = signal<string>('');
  statusFilter = signal<ApplicationStatus | 'ALL'>('ALL');
  businessTypeFilter = signal<string>('ALL');

  realtimeNotification = signal<StatusUpdateEvent | null>(null);
  assigningAppId = signal<string | null>(null);

  private searchSubject = new Subject<string>();

  constructor() {
    super();
    effect(() => {
      this.authService.currentUser();
      untracked(() => {
        this.page.set(1);
        this.statusFilter.set('ALL');
        this.businessTypeFilter.set('ALL');
        this.searchQuery.set('');
        this.loadCounts();
        this.loadApplications();
      });
    });
  }

  ngOnInit(): void {
    const queryParamsSub = this.route.queryParams.subscribe((params) => {
      const statusParam = (params['status'] as ApplicationStatus) || 'ALL';
      const pageParam = parseInt(params['page'], 10);
      const pageSizeParam = parseInt(params['pageSize'], 10);

      let changed = false;
      if (this.statusFilter() !== statusParam) {
        this.statusFilter.set(statusParam);
        changed = true;
      }
      if (pageParam && pageParam >= 1 && this.page() !== pageParam) {
        this.page.set(pageParam);
        changed = true;
      }
      if (pageSizeParam && pageSizeParam > 0 && this.pageSize() !== pageSizeParam) {
        this.pageSize.set(pageSizeParam);
        changed = true;
      }
      if (changed) {
        this.loadApplications();
        this.loadCounts();
      }
    });
    this.subscriptions.add(queryParamsSub);

    const searchSub = this.searchSubject.pipe(
      debounceTime(350),
      distinctUntilChanged()
    ).subscribe((term) => {
      this.searchQuery.set(term);
      this.page.set(1);
      this.loadApplications();
    });
    this.subscriptions.add(searchSub);

    const realtimeSub = this.realtimeService.updates$.subscribe((event) => {
      this.realtimeNotification.set(event);
      this.loadApplications();
      this.loadCounts();
      setTimeout(() => {
        if (this.realtimeNotification() === event) {
          this.realtimeNotification.set(null);
        }
      }, 5000);
    });
    this.subscriptions.add(realtimeSub);
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  loadCounts(): void {
    this.appService.getStatusCounts().subscribe({
      next: (counts) => this.statusCounts.set(counts),
      error: () => {}
    });
  }

  loadApplications(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.appService.getApplications({
      page: this.page(),
      pageSize: this.pageSize(),
      search: this.searchQuery(),
      status: this.statusFilter(),
      businessType: this.businessTypeFilter()
    }).subscribe({
      next: (result) => {
        this.applications.set(result.data);
        this.totalCount.set(result.total);
        this.totalPages.set(result.totalPages);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.hasError.set(true);
        this.errorMessage.set(err?.message || 'Failed to load merchant applications.');
      }
    });
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchSubject.next(input.value);
  }

  onStatusChange(status: ApplicationStatus | 'ALL'): void {
    this.statusFilter.set(status);
    this.page.set(1);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { status: status === 'ALL' ? null : status, page: 1 },
      queryParamsHandling: 'merge'
    });
    this.loadApplications();
  }

  onBusinessTypeChange(type: string): void {
    this.businessTypeFilter.set(type);
    this.page.set(1);
    this.loadApplications();
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.page.set(1);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { pageSize: size, page: 1 },
      queryParamsHandling: 'merge'
    });
    this.loadApplications();
  }

  goToPage(pageNum: number): void {
    if (pageNum >= 1 && pageNum <= this.totalPages() && pageNum !== this.page()) {
      this.page.set(pageNum);
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { page: pageNum },
        queryParamsHandling: 'merge'
      });
      this.loadApplications();
    }
  }

  retry(): void {
    this.loadApplications();
    this.loadCounts();
  }

  dismissNotification(): void {
    this.realtimeNotification.set(null);
  }

  getStatusBadgeClass(status: ApplicationStatus): string {
    switch (status) {
      case 'DRAFT': return 'badge-draft';
      case 'SUBMITTED': return 'badge-submitted';
      case 'UNDER_REVIEW': return 'badge-under-review';
      case 'APPROVED': return 'badge-approved';
      case 'REJECTED': return 'badge-rejected';
      default: return 'badge-draft';
    }
  }

  onAssignReviewer(app: MerchantApplication, reviewerId: string): void {
    if (!reviewerId || this.assigningAppId()) return;

    let reviewerName = 'Risk Underwriter 1';
    if (reviewerId === 'reviewer2') reviewerName = 'Risk Underwriter 2';
    if (reviewerId === 'reviewer3') reviewerName = 'Risk Underwriter 3';

    this.assigningAppId.set(app.id);
    const prevStatus = app.status;

    this.appService.assignReviewer(app.id, reviewerId, reviewerName).subscribe({
      next: (updatedApp) => {
        this.assigningAppId.set(null);
        this.realtimeService.simulateAssignment(
          updatedApp.id,
          updatedApp.businessName,
          reviewerName,
          prevStatus,
          updatedApp.status
        );
      },
      error: (err) => {
        this.assigningAppId.set(null);
        this.hasError.set(true);
        this.errorMessage.set(err?.message || 'Failed to assign reviewer.');
      }
    });
  }
}
