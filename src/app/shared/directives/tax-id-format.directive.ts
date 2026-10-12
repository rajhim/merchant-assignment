import { Directive, ElementRef, HostListener, inject, OnInit } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appTaxIdFormat]',
  standalone: true
})
export class TaxIdFormatDirective implements OnInit {
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
    const formatted = this.formatTaxId(rawValue);
    this.el.nativeElement.value = formatted;
    if (this.ngControl?.control && this.ngControl.control.value !== formatted) {
      this.ngControl.control.setValue(formatted, { emitModelToViewChange: false });
    }
  }

  private formatTaxId(value: string): string {
    if (!value) return '';
    const digits = value.replace(/\D/g, '').slice(0, 9);
    if (digits.length <= 2) {
      return digits;
    }
    return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  }
}
