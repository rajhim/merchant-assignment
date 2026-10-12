import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'maskSensitive',
  standalone: true
})
export class MaskSensitivePipe implements PipeTransform {
  transform(value: string | null | undefined, type: 'taxId' | 'bankAccount' | 'generic' = 'generic', revealed: boolean = false): string {
    if (!value) return '';
    if (revealed) return value;

    const trimmed = value.trim();

    if (type === 'taxId') {
      const clean = trimmed.replace(/\D/g, '');
      if (clean.length >= 4) {
        const last4 = clean.slice(-4);
        return `**-***${last4}`;
      }
      return '**-*******';
    }

    if (type === 'bankAccount') {
      const clean = trimmed.replace(/\s+/g, '');
      if (clean.length >= 4) {
        const last4 = clean.slice(-4);
        return `•••• •••• •••• ${last4}`;
      }
      return '•••• •••• •••• ••••';
    }

    if (trimmed.length <= 4) {
      return '••••';
    }
    const last4 = trimmed.slice(-4);
    return `${'•'.repeat(Math.max(4, trimmed.length - 4))} ${last4}`;
  }
}
