import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TaxIdFormatPipe } from '../../../../shared/pipes/tax-id-format.pipe';
import { ValidationErrorPipe } from '../../../../shared/pipes/validation-error.pipe';

@Component({
  selector: 'app-processing-review-step',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TaxIdFormatPipe,
    ValidationErrorPipe
  ],
  templateUrl: './processing-review-step.component.html'
})
export class ProcessingReviewStepComponent {
  @Input({ required: true }) group!: FormGroup;
  @Input() businessGroup?: FormGroup;

  isFieldInvalid(fieldName: string): boolean {
    const control = this.group?.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}
