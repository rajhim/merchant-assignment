import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProcessingReviewStepComponent } from './processing-review-step.component';

describe('ProcessingReviewStepComponent', () => {
  let fixture: ComponentFixture<ProcessingReviewStepComponent>;
  let component: ProcessingReviewStepComponent;
  let formGroup: FormGroup;
  let businessGroup: FormGroup;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProcessingReviewStepComponent, ReactiveFormsModule]
    }).compileComponents();

    businessGroup = new FormGroup({
      businessName: new FormControl('Acme Payment Corp'),
      taxId: new FormControl('12-3456789')
    });

    formGroup = new FormGroup({
      monthlyVolume: new FormControl(10000, [Validators.required, Validators.min(500)]),
      averageTicketSize: new FormControl(75, [Validators.required, Validators.min(1)]),
      currency: new FormControl('USD', Validators.required),
      agreementAccepted: new FormControl(false, Validators.requiredTrue)
    });

    fixture = TestBed.createComponent(ProcessingReviewStepComponent);
    component = fixture.componentInstance;
    component.group = formGroup;
    component.businessGroup = businessGroup;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should detect invalid volume below minimum', () => {
    const control = formGroup.get('monthlyVolume');
    control?.setValue(100);
    control?.markAsTouched();
    fixture.detectChanges();

    expect(component.isFieldInvalid('monthlyVolume')).toBe(true);
  });

  it('should display merchant entity summary from businessGroup', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Acme Payment Corp');
    expect(el.textContent).toContain('12-3456789');
  });

  it('should detect valid agreement', () => {
    const control = formGroup.get('agreementAccepted');
    control?.setValue(true);
    control?.markAsTouched();
    fixture.detectChanges();

    expect(component.isFieldInvalid('agreementAccepted')).toBe(false);
  });
});
