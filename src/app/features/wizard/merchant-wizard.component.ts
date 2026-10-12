import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { of } from 'rxjs';
import { debounceTime, switchMap, catchError } from 'rxjs/operators';
import { BaseComponent } from '../../core/base/base.component';
import { MerchantApplication } from '../../core/models/application.model';
import { BusinessProfileStepComponent } from './steps/business-profile-step/business-profile-step.component';
import { ContactInfoStepComponent } from './steps/contact-info-step/contact-info-step.component';
import { BankingInfoStepComponent } from './steps/banking-info-step/banking-info-step.component';
import { ProcessingReviewStepComponent } from './steps/processing-review-step/processing-review-step.component';

@Component({
  selector: 'app-merchant-wizard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    BusinessProfileStepComponent,
    ContactInfoStepComponent,
    BankingInfoStepComponent,
    ProcessingReviewStepComponent
  ],
  templateUrl: './merchant-wizard.component.html',
  styleUrl: './merchant-wizard.component.scss'
})
export class MerchantWizardComponent extends BaseComponent implements OnInit {
  private fb = inject(FormBuilder);
  private location = inject(Location);

  applicationForm!: FormGroup;
  currentStep = signal<number>(1);
  totalSteps = 4;
  applicationId = signal<string | null>(null);

  isSubmitting = signal<boolean>(false);
  autoSaveStatus = signal<string>('Changes will auto-save');
  autoSaveError = signal<string | null>(null);

  readonly steps = [
    { number: 1, title: 'Business Profile', desc: 'Legal entity details' },
    { number: 2, title: 'Authorized Contact', desc: 'Executive representation' },
    { number: 3, title: 'Settlement Account', desc: 'Banking & routing' },
    { number: 4, title: 'Processing & Review', desc: 'Volume & underwriting' }
  ];

  ngOnInit(): void {
    this.initForm();
    this.checkEditMode();
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  private initForm(): void {
    this.applicationForm = this.fb.group({
      businessInfo: this.fb.group({
        businessName: ['', [Validators.required, Validators.minLength(3)]],
        tradingName: ['', Validators.required],
        businessType: ['LLC', Validators.required],
        taxId: ['', [Validators.required, Validators.pattern(/^\d{2}-\d{7}$/)]],
        registrationNumber: ['', Validators.required],
        websiteUrl: [
          '',
          [
            Validators.required,
            Validators.pattern(/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/)
          ]
        ]
      }),
      contactInfo: this.fb.group({
        contactName: ['', [Validators.required, Validators.minLength(3)]],
        contactEmail: ['', [Validators.required, Validators.email]],
        contactPhone: [
          '',
          [
            Validators.required,
            Validators.pattern(/^\(\d{3}\) \d{3}-\d{4}$/)
          ]
        ],
        contactTitle: ['', Validators.required]
      }),
      bankingInfo: this.fb.group({
        bankName: ['', Validators.required],
        bankAccountNumber: ['', [Validators.required, Validators.pattern(/^\d{8,17}$/)]],
        routingNumber: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
        accountType: ['CHECKING', Validators.required]
      }),
      processingInfo: this.fb.group({
        monthlyVolume: [10000, [Validators.required, Validators.min(500)]],
        averageTicketSize: [75, [Validators.required, Validators.min(1)]],
        currency: ['USD', Validators.required],
        agreementAccepted: [false, Validators.requiredTrue]
      })
    });

    this.setupAutoSave();
  }

  private setupAutoSave(): void {
    const sub = this.applicationForm.valueChanges
      .pipe(
        debounceTime(1500),
        switchMap(() => {
          this.autoSaveStatus.set('Saving draft...');
          this.autoSaveError.set(null);
          const payload = this.flattenFormPayload('DRAFT');
          return this.appService.saveDraft(this.applicationId(), payload).pipe(
            catchError((err) => {
              this.autoSaveError.set(err?.message || 'Auto-save failed');
              this.autoSaveStatus.set('Auto-save error');
              return of(null);
            })
          );
        })
      )
      .subscribe((res) => {
        if (res) {
          if (!this.applicationId()) {
            this.applicationId.set(res.id);
            this.location.replaceState(`/applications/${res.id}/edit`);
          }
          const time = new Date().toLocaleTimeString();
          this.autoSaveStatus.set(`Draft saved at ${time} (Step ${this.currentStep()})`);
        }
      });
    this.subscriptions.add(sub);
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.applicationId.set(id);
      this.appService.getApplication(id).subscribe({
        next: (app) => {
          this.populateForm(app);
          const targetStep = app.currentStep || 1;
          if (targetStep >= 1 && targetStep <= this.totalSteps) {
            this.currentStep.set(targetStep);
          }
        },
        error: () => {
          this.router.navigate(['/dashboard']);
        }
      });
    }
  }

  private populateForm(app: MerchantApplication): void {
    this.applicationForm.patchValue({
      businessInfo: {
        businessName: app.businessName,
        tradingName: app.tradingName,
        businessType: app.businessType,
        taxId: app.taxId,
        registrationNumber: app.registrationNumber,
        websiteUrl: app.websiteUrl
      },
      contactInfo: {
        contactName: app.contactName,
        contactEmail: app.contactEmail,
        contactPhone: this.formatPhone(app.contactPhone),
        contactTitle: app.contactTitle
      },
      bankingInfo: {
        bankName: app.bankName,
        bankAccountNumber: app.bankAccountNumber,
        routingNumber: app.routingNumber,
        accountType: app.accountType
      },
      processingInfo: {
        monthlyVolume: app.monthlyVolume,
        averageTicketSize: app.averageTicketSize,
        currency: app.currency,
        agreementAccepted: true
      }
    }, { emitEvent: false });
  }

  private formatPhone(value: string | undefined): string {
    if (!value) return '';
    let digits = value.replace(/\D/g, '');
    if (digits.length === 11 && digits.startsWith('1')) {
      digits = digits.slice(1);
    }
    if (digits.length === 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    }
    return value;
  }

  get businessGroup(): FormGroup {
    return this.applicationForm.get('businessInfo') as FormGroup;
  }

  get contactGroup(): FormGroup {
    return this.applicationForm.get('contactInfo') as FormGroup;
  }

  get bankingGroup(): FormGroup {
    return this.applicationForm.get('bankingInfo') as FormGroup;
  }

  get processingGroup(): FormGroup {
    return this.applicationForm.get('processingInfo') as FormGroup;
  }

  isFieldInvalid(group: FormGroup, fieldName: string): boolean {
    const control = group.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  canProceedCurrentStep(): boolean {
    if (this.currentStep() === 1) return this.businessGroup.valid;
    if (this.currentStep() === 2) return this.contactGroup.valid;
    if (this.currentStep() === 3) return this.bankingGroup.valid;
    if (this.currentStep() === 4) return this.processingGroup.valid;
    return false;
  }

  goToStep(stepNumber: number): void {
    if (stepNumber < this.currentStep()) {
      this.currentStep.set(stepNumber);
      this.autoSaveDraft();
      return;
    }
    if (stepNumber > this.currentStep() && !this.canProceedCurrentStep()) {
      this.markCurrentStepTouched();
      return;
    }
    this.currentStep.set(stepNumber);
    this.autoSaveDraft();
  }

  nextStep(): void {
    if (this.canProceedCurrentStep()) {
      if (this.currentStep() < this.totalSteps) {
        this.currentStep.update((s) => s + 1);
        this.autoSaveDraft();
      }
    } else {
      this.markCurrentStepTouched();
    }
  }

  prevStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.update((s) => s - 1);
      this.autoSaveDraft();
    }
  }

  private markCurrentStepTouched(): void {
    let group: FormGroup | null = null;
    if (this.currentStep() === 1) group = this.businessGroup;
    if (this.currentStep() === 2) group = this.contactGroup;
    if (this.currentStep() === 3) group = this.bankingGroup;
    if (this.currentStep() === 4) group = this.processingGroup;
    if (group) {
      group.markAllAsTouched();
    }
  }

  autoSaveDraft(): void {
    this.autoSaveStatus.set('Saving draft...');
    this.autoSaveError.set(null);
    const payload = this.flattenFormPayload('DRAFT');
    const sub = this.appService.saveDraft(this.applicationId(), payload).subscribe({
      next: (res) => {
        if (!this.applicationId()) {
          this.applicationId.set(res.id);
          this.location.replaceState(`/applications/${res.id}/edit`);
        }
        const time = new Date().toLocaleTimeString();
        this.autoSaveStatus.set(`Draft saved at ${time} (Step ${this.currentStep()})`);
      },
      error: (err) => {
        this.autoSaveError.set(err?.message || 'Failed to auto-save draft');
        this.autoSaveStatus.set('Auto-save error');
      }
    });
    this.subscriptions.add(sub);
  }

  manualSaveDraft(): void {
    this.autoSaveDraft();
  }

  submitApplication(): void {
    if (this.applicationForm.invalid) {
      this.applicationForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const payload = this.flattenFormPayload('SUBMITTED');

    const request$ = this.applicationId()
      ? this.appService.updateApplication(this.applicationId()!, payload)
      : this.appService.createApplication(payload);

    request$.subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.router.navigate(['/applications', res.id]);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.autoSaveError.set(err?.message || 'Submission failed');
      }
    });
  }

  private flattenFormPayload(status: 'DRAFT' | 'SUBMITTED'): Partial<MerchantApplication> {
    const b = this.businessGroup.value;
    const c = this.contactGroup.value;
    const bk = this.bankingGroup.value;
    const p = this.processingGroup.value;

    return {
      businessName: b.businessName,
      tradingName: b.tradingName,
      businessType: b.businessType,
      taxId: b.taxId,
      registrationNumber: b.registrationNumber,
      websiteUrl: b.websiteUrl,
      contactName: c.contactName,
      contactEmail: c.contactEmail,
      contactPhone: c.contactPhone,
      contactTitle: c.contactTitle,
      bankName: bk.bankName,
      bankAccountNumber: bk.bankAccountNumber,
      routingNumber: bk.routingNumber,
      accountType: bk.accountType,
      monthlyVolume: Number(p.monthlyVolume) || 0,
      averageTicketSize: Number(p.averageTicketSize) || 0,
      currency: p.currency,
      currentStep: this.currentStep(),
      status
    };
  }
}
