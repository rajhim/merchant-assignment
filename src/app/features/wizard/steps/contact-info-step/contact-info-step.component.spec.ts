import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ContactInfoStepComponent } from './contact-info-step.component';

describe('ContactInfoStepComponent', () => {
  let fixture: ComponentFixture<ContactInfoStepComponent>;
  let component: ContactInfoStepComponent;
  let formGroup: FormGroup;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactInfoStepComponent, ReactiveFormsModule]
    }).compileComponents();

    formGroup = new FormGroup({
      contactName: new FormControl('', [Validators.required, Validators.minLength(3)]),
      contactEmail: new FormControl('', [Validators.required, Validators.email]),
      contactPhone: new FormControl('', [Validators.required]),
      contactTitle: new FormControl('', Validators.required)
    });

    fixture = TestBed.createComponent(ContactInfoStepComponent);
    component = fixture.componentInstance;
    component.group = formGroup;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should detect invalid contactEmail', () => {
    const control = formGroup.get('contactEmail');
    control?.setValue('invalid-email');
    control?.markAsTouched();
    fixture.detectChanges();

    expect(component.isFieldInvalid('contactEmail')).toBe(true);
  });

  it('should detect valid contact details', () => {
    formGroup.patchValue({
      contactName: 'Jane Executive',
      contactEmail: 'jane@dummy.internal',
      contactPhone: '(555) 019-0199',
      contactTitle: 'Managing Partner'
    });
    formGroup.markAllAsTouched();
    fixture.detectChanges();

    expect(component.isFieldInvalid('contactName')).toBe(false);
    expect(component.isFieldInvalid('contactEmail')).toBe(false);
    expect(component.isFieldInvalid('contactPhone')).toBe(false);
  });
});
