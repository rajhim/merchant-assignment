import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TaxIdFormatDirective } from '../../../../shared/directives/tax-id-format.directive';
import { ValidationErrorPipe } from '../../../../shared/pipes/validation-error.pipe';

@Component({
  selector: 'app-business-profile-step',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TaxIdFormatDirective,
    ValidationErrorPipe
  ],
  templateUrl: './business-profile-step.component.html'
})
export class BusinessProfileStepComponent {
  @Input({ required: true }) group!: FormGroup;

  isFieldInvalid(fieldName: string): boolean {
    const control = this.group?.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}
