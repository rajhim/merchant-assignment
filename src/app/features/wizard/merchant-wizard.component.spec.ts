import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { MerchantWizardComponent } from './merchant-wizard.component';
import { ApplicationService } from '../../core/services/application.service';
import { of } from 'rxjs';

describe('MerchantWizardComponent', () => {
  let fixture: ComponentFixture<MerchantWizardComponent>;
  let component: MerchantWizardComponent;
  let appService: ApplicationService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MerchantWizardComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    }).compileComponents();

    appService = TestBed.inject(ApplicationService);
    vi.spyOn(appService, 'saveDraft').mockReturnValue(
      of({ id: 'APP-999', businessName: 'Draft Test', currentStep: 1 } as any)
    );

    fixture = TestBed.createComponent(MerchantWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should initialize form and start at step 1', () => {
    expect(component.currentStep()).toBe(1);
    expect(component.applicationForm.contains('businessInfo')).toBe(true);
    expect(component.applicationForm.contains('contactInfo')).toBe(true);
    expect(component.applicationForm.contains('bankingInfo')).toBe(true);
    expect(component.applicationForm.contains('processingInfo')).toBe(true);
  });

  it('should not advance to step 2 if step 1 is invalid', () => {
    component.nextStep();
    expect(component.currentStep()).toBe(1);
    expect(component.businessGroup.invalid).toBe(true);
  });

  it('should advance to step 2 and auto-save draft when step 1 is valid', () => {
    component.businessGroup.setValue({
      businessName: 'Fintech Corp',
      tradingName: 'Fintech Store',
      businessType: 'LLC',
      taxId: '12-3456789',
      registrationNumber: 'REG-12345',
      websiteUrl: 'https://fintech.internal'
    });

    expect(component.businessGroup.valid).toBe(true);
    component.nextStep();
    expect(component.currentStep()).toBe(2);
    expect(appService.saveDraft).toHaveBeenCalledWith(
      null,
      expect.objectContaining({ currentStep: 2, status: 'DRAFT' })
    );
  });

  it('should auto-save draft with updated step on goToStep', () => {
    component.currentStep.set(3);
    component.goToStep(1);
    expect(component.currentStep()).toBe(1);
    expect(appService.saveDraft).toHaveBeenCalledWith(
      null,
      expect.objectContaining({ currentStep: 1, status: 'DRAFT' })
    );
  });

  it('should auto-save draft with updated step on prevStep', () => {
    component.currentStep.set(3);
    component.prevStep();
    expect(component.currentStep()).toBe(2);
    expect(appService.saveDraft).toHaveBeenCalledWith(
      null,
      expect.objectContaining({ currentStep: 2, status: 'DRAFT' })
    );
  });

  it('should trigger draft save on manualSaveDraft', () => {
    component.manualSaveDraft();
    expect(appService.saveDraft).toHaveBeenCalled();
  });

  it('should validate Tax ID format', () => {
    const taxControl = component.businessGroup.get('taxId');
    taxControl?.setValue('invalid-tax');
    expect(taxControl?.invalid).toBe(true);

    taxControl?.setValue('12-3456789');
    expect(taxControl?.valid).toBe(true);
  });

  it('should auto-format taxId input via directive', () => {
    const taxInput: HTMLInputElement = fixture.nativeElement.querySelector('input[formControlName="taxId"]');
    taxInput.value = '123456789';
    taxInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(taxInput.value).toBe('12-3456789');
    expect(component.businessGroup.get('taxId')?.value).toBe('12-3456789');
  });

  it('should validate 9-digit routing number format', () => {
    const routingControl = component.bankingGroup.get('routingNumber');
    routingControl?.setValue('1234');
    expect(routingControl?.invalid).toBe(true);

    routingControl?.setValue('121000358');
    expect(routingControl?.valid).toBe(true);
  });

  it('should navigate step and update in-memory currentStep signal', () => {
    component.currentStep.set(3);
    component.goToStep(1);
    expect(component.currentStep()).toBe(1);
  });

  it('should restore application step from backend application in checkEditMode', () => {
    vi.spyOn((component as any).route.snapshot.paramMap, 'get').mockReturnValue('APP-DRAFT-1');
    vi.spyOn(appService, 'getApplication').mockReturnValue(
      of({
        id: 'APP-DRAFT-1',
        businessName: 'Restored Draft',
        status: 'DRAFT',
        currentStep: 3
      } as any)
    );

    (component as any).checkEditMode();

    expect(component.applicationId()).toBe('APP-DRAFT-1');
    expect(component.currentStep()).toBe(3);
  });

  it('should validate contactPhone in (XXX) XXX-XXXX format', () => {
    const phoneControl = component.contactGroup.get('contactPhone');
    phoneControl?.setValue('5551234567');
    expect(phoneControl?.invalid).toBe(true);

    phoneControl?.setValue('(555) 123-4567');
    expect(phoneControl?.valid).toBe(true);
  });
});
