import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { PhoneFormatDirective } from './phone-format.directive';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, PhoneFormatDirective],
  template: `<input type="tel" [formControl]="phoneControl" appPhoneFormat />`
})
class TestPhoneHostComponent {
  phoneControl = new FormControl('');
}

describe('PhoneFormatDirective', () => {
  let fixture: ComponentFixture<TestPhoneHostComponent>;
  let component: TestPhoneHostComponent;
  let inputEl: HTMLInputElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestPhoneHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestPhoneHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    inputEl = fixture.nativeElement.querySelector('input');
  });

  it('should format 10 digits as (XXX) XXX-XXXX', () => {
    inputEl.value = '5551234567';
    inputEl.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(inputEl.value).toBe('(555) 123-4567');
    expect(component.phoneControl.value).toBe('(555) 123-4567');
  });

  it('should format partial phone numbers with parentheses', () => {
    inputEl.value = '555';
    inputEl.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(inputEl.value).toBe('(555');

    inputEl.value = '55512';
    inputEl.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(inputEl.value).toBe('(555) 12');
  });

  it('should format on blur event', () => {
    inputEl.value = '8005550199';
    inputEl.dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    expect(inputEl.value).toBe('(800) 555-0199');
  });

  it('should handle empty input', () => {
    inputEl.value = '';
    inputEl.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(inputEl.value).toBe('');
    expect(component.phoneControl.value).toBe('');
  });

  it('should format 11 digits starting with 1 by stripping country code', () => {
    inputEl.value = '15551234567';
    inputEl.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(inputEl.value).toBe('(555) 123-4567');
    expect(component.phoneControl.value).toBe('(555) 123-4567');
  });
});
