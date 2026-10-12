import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'taxIdFormat',
  standalone: true
})
export class TaxIdFormatPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';
    const digits = value.replace(/\D/g, '').slice(0, 9);
    if (digits.length <= 2) {
      return digits;
    }
    return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  }
}
