import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NumericOnlyDirective } from './numeric-only.directive';

@Component({
  selector: 'test-numeric-host',
  standalone: true,
  imports: [ReactiveFormsModule, NumericOnlyDirective],
  template: `
    <input
      type="text"
      [formControl]="control"
      appNumericOnly
      [maxDigits]="maxDigits"
    />
  `
})
class TestNumericHostComponent {
  control = new FormControl('');
  maxDigits?: number;
}

@Component({
  selector: 'test-numeric-max-host',
  standalone: true,
  imports: [ReactiveFormsModule, NumericOnlyDirective],
  template: `
    <input
      type="text"
      [formControl]="control"
      appNumericOnly
      [maxDigits]="4"
    />
  `
})
class TestNumericMaxHostComponent {
  control = new FormControl('');
}

describe('NumericOnlyDirective', () => {
  let fixture: ComponentFixture<TestNumericHostComponent>;
  let component: TestNumericHostComponent;
  let inputEl: HTMLInputElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestNumericHostComponent, TestNumericMaxHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestNumericHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    inputEl = fixture.nativeElement.querySelector('input');
  });

  it('should allow numeric keydown events', () => {
    const event = new KeyboardEvent('keydown', { key: '5', cancelable: true });
    inputEl.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });

  it('should prevent non-numeric keydown events', () => {
    const event = new KeyboardEvent('keydown', { key: 'a', cancelable: true });
    inputEl.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });

  it('should allow navigation keys such as Backspace and ArrowLeft', () => {
    const backspace = new KeyboardEvent('keydown', { key: 'Backspace', cancelable: true });
    inputEl.dispatchEvent(backspace);
    expect(backspace.defaultPrevented).toBe(false);

    const arrow = new KeyboardEvent('keydown', { key: 'ArrowLeft', cancelable: true });
    inputEl.dispatchEvent(arrow);
    expect(arrow.defaultPrevented).toBe(false);
  });

  it('should allow ctrl+a or ctrl+c shortcuts', () => {
    const ctrlA = new KeyboardEvent('keydown', { key: 'a', ctrlKey: true, cancelable: true });
    inputEl.dispatchEvent(ctrlA);
    expect(ctrlA.defaultPrevented).toBe(false);
  });

  it('should clean non-digits on input event', () => {
    inputEl.value = '123abc456';
    inputEl.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(inputEl.value).toBe('123456');
    expect(component.control.value).toBe('123456');
  });

  it('should restrict to maxDigits if provided', () => {
    const maxFixture = TestBed.createComponent(TestNumericMaxHostComponent);
    maxFixture.detectChanges();
    const maxInput = maxFixture.nativeElement.querySelector('input');

    maxInput.value = '1234567';
    maxInput.dispatchEvent(new Event('input'));
    maxFixture.detectChanges();

    expect(maxInput.value).toBe('1234');
    expect(maxFixture.componentInstance.control.value).toBe('1234');
  });

  it('should sanitize clipboard on paste event', () => {
    const pasteEvent = new Event('paste', { cancelable: true }) as any;
    pasteEvent.clipboardData = {
      getData: () => 'abc987xyz'
    };

    inputEl.dispatchEvent(pasteEvent);
    fixture.detectChanges();

    expect(inputEl.value).toBe('987');
    expect(component.control.value).toBe('987');
  });
});
