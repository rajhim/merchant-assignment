import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BaseComponent } from '../../core/base/base.component';
import { MaskSensitivePipe } from '../../shared/pipes/mask-sensitive.pipe';
import { PhoneFormatPipe } from '../../shared/pipes/phone-format.pipe';
import { MerchantApplication, ApplicationStatus } from '../../core/models/application.model';

@Component({
  selector: 'app-application-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MaskSensitivePipe, PhoneFormatPipe],
  templateUrl: './application-detail.component.html',
  styleUrl: './application-detail.component.scss'
})
export class ApplicationDetailComponent extends BaseComponent implements OnInit {
  application = signal<MerchantApplication | null>(null);
  isLoading = signal<boolean>(true);
  hasError = signal<boolean>(false);
  errorMessage = signal<string>('');

  revealedTaxId = signal<boolean>(false);
  revealedBankAccount = signal<boolean>(false);
  auditLog = signal<string[]>([]);

  decisionType: 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES' = 'APPROVE';
  decisionNotes: string = '';
  isSubmittingDecision = signal<boolean>(false);
  decisionError = signal<string | null>(null);

  selectedAssigneeId: string = 'reviewer';
  showRiskDecisionModal = false;
  isAssigning = signal<boolean>(false);
  assignmentNotification = signal<string | null>(null);
  assignmentError = signal<string | null>(null);

  canReviewApplication(): boolean {
    const app = this.application();
    if (!app) return false;
    if (app.status === 'DRAFT') return false;
    if (this.authService.hasRole(['ADMIN'])) return true;
    if (this.authService.hasRole(['REVIEWER'])) {
      if (app.assignedReviewerId !== this.authService.currentUser().id) {
        return false;
      }
      if (app.status === 'APPROVED' || app.status === 'REJECTED') {
        return false;
      }
      return true;
    }
    return false;
  }

  openRiskDecisionModal(): void {
    if (!this.canReviewApplication()) return;
    this.decisionError.set(null);
    this.showRiskDecisionModal = true;
  }

  closeRiskDecisionModal(): void {
    this.showRiskDecisionModal = false;
    this.decisionError.set(null);
  }

  ngOnInit(): void {
    this.loadApplication();
  }

  loadApplication(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/dashboard']);
      return;
    }

    this.isLoading.set(true);
    this.hasError.set(false);

    this.appService.getApplication(id).subscribe({
      next: (app) => {
        this.application.set(app);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.hasError.set(true);
        this.errorMessage.set(err?.message || 'Failed to load application.');
      }
    });
  }

  canRevealSensitive(): boolean {
    return this.authService.hasRole(['REVIEWER', 'ADMIN']);
  }

  toggleTaxId(): void {
    if (!this.canRevealSensitive()) return;
    const nextState = !this.revealedTaxId();
    this.revealedTaxId.set(nextState);
    if (nextState) {
      this.recordAudit(`Tax ID unmasked by ${this.authService.currentUser().name} (${this.authService.userRole()})`);
    }
  }

  toggleBankAccount(): void {
    if (!this.canRevealSensitive()) return;
    const nextState = !this.revealedBankAccount();
    this.revealedBankAccount.set(nextState);
    if (nextState) {
      this.recordAudit(`Settlement Bank Account unmasked by ${this.authService.currentUser().name} (${this.authService.userRole()})`);
    }
  }

  private recordAudit(action: string): void {
    const log = `[${new Date().toLocaleTimeString()}] AUDIT: ${action}`;
    this.auditLog.update((logs) => [log, ...logs]);
  }

  submitRiskDecision(): void {
    const app = this.application();
    if (!app) return;
    if (!this.canReviewApplication()) {
      this.decisionError.set('Decision is locked for Reviewers. Only administrators can modify submitted decisions.');
      return;
    }
    if (!this.decisionNotes.trim()) {
      this.decisionError.set('Decision notes are mandatory for risk audit compliance.');
      return;
    }

    this.isSubmittingDecision.set(true);
    this.decisionError.set(null);

    const prevStatus = app.status;

    this.appService.recordRiskDecision(app.id, this.decisionType, this.decisionNotes.trim())
      .subscribe({
        next: (updatedApp) => {
          this.application.set(updatedApp);
          this.isSubmittingDecision.set(false);
          this.decisionNotes = '';
          this.showRiskDecisionModal = false;
          this.realtimeService.simulateIncomingUpdate(
            updatedApp.id,
            updatedApp.businessName,
            prevStatus,
            updatedApp.status
          );
        },
        error: (err) => {
          this.isSubmittingDecision.set(false);
          this.decisionError.set(err?.message || 'Failed to record risk decision.');
        }
      });
  }

  assignReviewer(): void {
    const app = this.application();
    if (!app || this.isAssigning()) return;

    let reviewerName = 'Risk Underwriter 1';
    if (this.selectedAssigneeId === 'reviewer2') reviewerName = 'Risk Underwriter 2';
    if (this.selectedAssigneeId === 'reviewer3') reviewerName = 'Risk Underwriter 3';

    this.isAssigning.set(true);
    this.assignmentError.set(null);
    this.assignmentNotification.set(null);

    const prevStatus = app.status;

    this.appService.assignReviewer(app.id, this.selectedAssigneeId, reviewerName)
      .subscribe({
        next: (updatedApp) => {
          this.application.set(updatedApp);
          this.isAssigning.set(false);
          this.assignmentNotification.set(`Application ${app.id} (${app.businessName}) has been successfully assigned to ${reviewerName}.`);
          this.recordAudit(`Application assigned to ${reviewerName} (${this.selectedAssigneeId}) by ${this.authService.currentUser().name}`);
          this.realtimeService.simulateAssignment(
            updatedApp.id,
            updatedApp.businessName,
            reviewerName,
            prevStatus,
            updatedApp.status
          );
          setTimeout(() => {
            if (this.assignmentNotification()?.includes(app.id)) {
              this.assignmentNotification.set(null);
            }
          }, 6000);
        },
        error: (err) => {
          this.isAssigning.set(false);
          this.assignmentError.set(err?.message || 'Failed to update reviewer assignment.');
        }
      });
  }

  dismissAssignmentNotification(): void {
    this.assignmentNotification.set(null);
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
}
