import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PhoneFormatDirective } from '../../../../shared/directives/phone-format.directive';
import { ValidationErrorPipe } from '../../../../shared/pipes/validation-error.pipe';

@Component({
  selector: 'app-contact-info-step',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PhoneFormatDirective,
    ValidationErrorPipe
  ],
  templateUrl: './contact-info-step.component.html'
})
export class ContactInfoStepComponent {
  @Input({ required: true }) group!: FormGroup;

  isFieldInvalid(fieldName: string): boolean {
    const control = this.group?.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}
