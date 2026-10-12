import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TaxIdFormatDirective } from './tax-id-format.directive';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, TaxIdFormatDirective],
  template: `<input type="text" [formControl]="taxControl" appTaxIdFormat />`
})
class TestHostComponent {
  taxControl = new FormControl('');
}

describe('TaxIdFormatDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let component: TestHostComponent;
  let inputEl: HTMLInputElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    inputEl = fixture.nativeElement.querySelector('input');
  });

  it('should format raw digits into XX-XXXXXXX on input', () => {
    inputEl.value = '123456789';
    inputEl.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(inputEl.value).toBe('12-3456789');
    expect(component.taxControl.value).toBe('12-3456789');
  });

  it('should ignore non-digit characters and truncate at 9 digits', () => {
    inputEl.value = '12abc345-678900';
    inputEl.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(inputEl.value).toBe('12-3456789');
    expect(component.taxControl.value).toBe('12-3456789');
  });

  it('should keep less than 3 digits unhyphenated', () => {
    inputEl.value = '12';
    inputEl.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(inputEl.value).toBe('12');
    expect(component.taxControl.value).toBe('12');
  });

  it('should handle blur event to ensure formatting', () => {
    inputEl.value = '987654321';
    inputEl.dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    expect(inputEl.value).toBe('98-7654321');
  });

  it('should handle empty input gracefully', () => {
    inputEl.value = '';
    inputEl.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(inputEl.value).toBe('');
    expect(component.taxControl.value).toBe('');
  });
});
