import { Directive, ElementRef, HostListener, Input, inject } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appNumericOnly]',
  standalone: true
})
export class NumericOnlyDirective {
  private el = inject(ElementRef<HTMLInputElement>);
  private ngControl = inject(NgControl, { optional: true });

  @Input() maxDigits?: number;

  private readonly navigationKeys = [
    'Backspace',
    'Delete',
    'Tab',
    'Escape',
    'Enter',
    'Home',
    'End',
    'ArrowLeft',
    'ArrowRight',
    'Clear',
    'Copy',
    'Paste'
  ];

  private get effectiveLimit(): number | undefined {
    if (this.maxDigits !== undefined && !isNaN(this.maxDigits)) {
      return this.maxDigits;
    }
    const htmlMax = this.el.nativeElement.maxLength;
    if (htmlMax > 0 && htmlMax < 1000) {
      return htmlMax;
    }
    return undefined;
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (
      this.navigationKeys.includes(event.key) ||
      (event.ctrlKey && ['a', 'c', 'v', 'x', 'z'].includes(event.key.toLowerCase())) ||
      (event.metaKey && ['a', 'c', 'v', 'x', 'z'].includes(event.key.toLowerCase()))
    ) {
      return;
    }

    if (!/^\d$/.test(event.key)) {
      event.preventDefault();
      return;
    }

    const limit = this.effectiveLimit;
    if (
      limit !== undefined &&
      this.el.nativeElement.value.length >= limit &&
      this.el.nativeElement.selectionStart === this.el.nativeElement.selectionEnd
    ) {
      event.preventDefault();
    }
  }

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let clean = input.value.replace(/\D/g, '');
    const limit = this.effectiveLimit;
    if (limit !== undefined && clean.length > limit) {
      clean = clean.slice(0, limit);
    }
    input.value = clean;
    if (this.ngControl?.control && this.ngControl.control.value !== clean) {
      this.ngControl.control.setValue(clean, { emitModelToViewChange: false });
    }
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent): void {
    const clipboardData = event.clipboardData?.getData('text') || '';
    if (!clipboardData) return;
    event.preventDefault();

    let digits = clipboardData.replace(/\D/g, '');
    const input = this.el.nativeElement;
    const current = input.value;
    const start = input.selectionStart ?? current.length;
    const end = input.selectionEnd ?? current.length;

    let next = current.slice(0, start) + digits + current.slice(end);
    const limit = this.effectiveLimit;
    if (limit !== undefined && next.length > limit) {
      next = next.slice(0, limit);
    }

    input.value = next;
    const newCursor = Math.min(start + digits.length, next.length);
    input.setSelectionRange(newCursor, newCursor);

    if (this.ngControl?.control) {
      this.ngControl.control.setValue(next, { emitModelToViewChange: false });
    }
  }
}
