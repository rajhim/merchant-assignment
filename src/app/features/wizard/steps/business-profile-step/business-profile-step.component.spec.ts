import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BusinessProfileStepComponent } from './business-profile-step.component';

describe('BusinessProfileStepComponent', () => {
  let fixture: ComponentFixture<BusinessProfileStepComponent>;
  let component: BusinessProfileStepComponent;
  let formGroup: FormGroup;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BusinessProfileStepComponent, ReactiveFormsModule]
    }).compileComponents();

    formGroup = new FormGroup({
      businessName: new FormControl('', [Validators.required, Validators.minLength(3)]),
      tradingName: new FormControl('', Validators.required),
      businessType: new FormControl('LLC', Validators.required),
      taxId: new FormControl('', [Validators.required, Validators.pattern(/^\d{2}-\d{7}$/)]),
      registrationNumber: new FormControl('', Validators.required),
      websiteUrl: new FormControl('', Validators.required)
    });

    fixture = TestBed.createComponent(BusinessProfileStepComponent);
    component = fixture.componentInstance;
    component.group = formGroup;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should detect invalid touched field', () => {
    const control = formGroup.get('businessName');
    control?.markAsTouched();
    fixture.detectChanges();

    expect(component.isFieldInvalid('businessName')).toBe(true);
  });

  it('should detect valid field', () => {
    const control = formGroup.get('businessName');
    control?.setValue('Valid Business LLC');
    control?.markAsTouched();
    fixture.detectChanges();

    expect(component.isFieldInvalid('businessName')).toBe(false);
  });
});
