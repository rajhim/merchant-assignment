import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NumericOnlyDirective } from '../../../../shared/directives/numeric-only.directive';
import { ValidationErrorPipe } from '../../../../shared/pipes/validation-error.pipe';

@Component({
  selector: 'app-banking-info-step',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NumericOnlyDirective,
    ValidationErrorPipe
  ],
  templateUrl: './banking-info-step.component.html'
})
export class BankingInfoStepComponent {
  @Input({ required: true }) group!: FormGroup;

  isFieldInvalid(fieldName: string): boolean {
    const control = this.group?.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}
