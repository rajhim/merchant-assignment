import { Pipe, PipeTransform } from '@angular/core';
import { ValidationErrors } from '@angular/forms';

@Pipe({
  name: 'validationError',
  standalone: true
})
export class ValidationErrorPipe implements PipeTransform {
  transform(errors: ValidationErrors | null | undefined, label: string = 'Field'): string {
    if (!errors) return '';

    if (errors['required'] || errors['requiredTrue']) {
      return `${label} is required.`;
    }

    if (errors['minlength']) {
      return `${label} must be at least ${errors['minlength'].requiredLength} characters.`;
    }

    if (errors['maxlength']) {
      return `${label} must not exceed ${errors['maxlength'].requiredLength} characters.`;
    }

    if (errors['email']) {
      return `A valid email address is required.`;
    }

    if (errors['min']) {
      return `Minimum value is ${errors['min'].min}.`;
    }

    if (errors['pattern']) {
      return `Invalid ${label.toLowerCase()} format.`;
    }

    return `Invalid value.`;
  }
}
