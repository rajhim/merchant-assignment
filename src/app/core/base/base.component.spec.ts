import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { Subscription } from 'rxjs';
import { BaseComponent } from './base.component';

@Component({
  template: ''
})
class TestDerivedComponent extends BaseComponent {
  testSubscription = new Subscription();

  constructor() {
    super();
    this.subscriptions.add(this.testSubscription);
  }
}

describe('BaseComponent', () => {
  let component: TestDerivedComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestDerivedComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(TestDerivedComponent);
    component = fixture.componentInstance;
  });

  it('should initialize and inject core services via base class', () => {
    expect(component).toBeTruthy();
    expect(component.appService).toBeTruthy();
    expect(component.authService).toBeTruthy();
    expect(component.realtimeService).toBeTruthy();
  });

  it('should unsubscribe from managed subscriptions on ngOnDestroy', () => {
    expect(component.testSubscription.closed).toBe(false);
    component.ngOnDestroy();
    expect(component.testSubscription.closed).toBe(true);
  });
});
