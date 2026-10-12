import { Directive, ElementRef, HostListener, inject, OnInit } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appPhoneFormat]',
  standalone: true
})
export class PhoneFormatDirective implements OnInit {
  private el = inject(ElementRef<HTMLInputElement>);
  private ngControl = inject(NgControl, { optional: true });

  ngOnInit(): void {
    if (this.el.nativeElement.value) {
      this.formatAndApply(this.el.nativeElement.value);
    }
  }

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.formatAndApply(input.value);
  }

  @HostListener('blur')
  onBlur(): void {
    this.formatAndApply(this.el.nativeElement.value);
  }

  private formatAndApply(rawValue: string): void {
    const formatted = this.formatPhoneNumber(rawValue);
    this.el.nativeElement.value = formatted;
    if (this.ngControl?.control && this.ngControl.control.value !== formatted) {
      this.ngControl.control.setValue(formatted, { emitModelToViewChange: false });
    }
  }

  private formatPhoneNumber(value: string): string {
    if (!value) return '';
    let digits = value.replace(/\D/g, '');
    if (digits.length === 11 && digits.startsWith('1')) {
      digits = digits.slice(1);
    }
    digits = digits.slice(0, 10);
    if (digits.length === 0) return '';
    if (digits.length <= 3) {
      return `(${digits}`;
    }
    if (digits.length <= 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    }
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  }
}
