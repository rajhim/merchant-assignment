import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BankingInfoStepComponent } from './banking-info-step.component';

describe('BankingInfoStepComponent', () => {
  let fixture: ComponentFixture<BankingInfoStepComponent>;
  let component: BankingInfoStepComponent;
  let formGroup: FormGroup;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BankingInfoStepComponent, ReactiveFormsModule]
    }).compileComponents();

    formGroup = new FormGroup({
      bankName: new FormControl('', Validators.required),
      bankAccountNumber: new FormControl('', [Validators.required, Validators.pattern(/^\d{8,17}$/)]),
      routingNumber: new FormControl('', [Validators.required, Validators.pattern(/^\d{9}$/)]),
      accountType: new FormControl('CHECKING', Validators.required)
    });

    fixture = TestBed.createComponent(BankingInfoStepComponent);
    component = fixture.componentInstance;
    component.group = formGroup;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should detect invalid routing number', () => {
    const control = formGroup.get('routingNumber');
    control?.setValue('123');
    control?.markAsTouched();
    fixture.detectChanges();

    expect(component.isFieldInvalid('routingNumber')).toBe(true);
  });

  it('should detect valid banking details', () => {
    formGroup.patchValue({
      bankName: 'Dummy Reserve Bank',
      bankAccountNumber: '9876543210',
      routingNumber: '121000358',
      accountType: 'CHECKING'
    });
    formGroup.markAllAsTouched();
    fixture.detectChanges();

    expect(component.isFieldInvalid('bankName')).toBe(false);
    expect(component.isFieldInvalid('bankAccountNumber')).toBe(false);
    expect(component.isFieldInvalid('routingNumber')).toBe(false);
  });
});
