import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentRef } from '@angular/core';
import { PaginationComponent } from './pagination.component';

describe('PaginationComponent', () => {
  let component: PaginationComponent;
  let componentRef: ComponentRef<PaginationComponent>;
  let fixture: ComponentFixture<PaginationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginationComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PaginationComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate entry numbers correctly', () => {
    componentRef.setInput('page', 2);
    componentRef.setInput('pageSize', 5);
    componentRef.setInput('totalCount', 12);
    componentRef.setInput('currentCount', 5);
    fixture.detectChanges();

    expect(component.startEntry()).toBe(6);
    expect(component.endEntry()).toBe(10);
  });

  it('should handle zero totalCount', () => {
    componentRef.setInput('page', 1);
    componentRef.setInput('pageSize', 5);
    componentRef.setInput('totalCount', 0);
    componentRef.setInput('currentCount', 0);
    fixture.detectChanges();

    expect(component.startEntry()).toBe(0);
    expect(component.endEntry()).toBe(0);
  });

  it('should calculate pages array correctly', () => {
    componentRef.setInput('totalPages', 3);
    componentRef.setInput('page', 1);
    fixture.detectChanges();
    expect(component.pages()).toEqual([1, 2, 3]);

    componentRef.setInput('totalPages', 10);
    componentRef.setInput('page', 5);
    fixture.detectChanges();
    expect(component.pages()).toEqual([3, 4, 5, 6, 7]);
  });

  it('should emit pageChange on goToPage with valid target page', () => {
    componentRef.setInput('totalPages', 5);
    componentRef.setInput('page', 1);
    fixture.detectChanges();

    const emitSpy = vi.fn();
    component.pageChange.subscribe(emitSpy);

    component.goToPage(2);
    expect(emitSpy).toHaveBeenCalledWith(2);
  });

  it('should not emit pageChange when target page is current page or invalid', () => {
    componentRef.setInput('totalPages', 5);
    componentRef.setInput('page', 2);
    fixture.detectChanges();

    const emitSpy = vi.fn();
    component.pageChange.subscribe(emitSpy);

    component.goToPage(2);
    expect(emitSpy).not.toHaveBeenCalled();

    component.goToPage(0);
    expect(emitSpy).not.toHaveBeenCalled();

    component.goToPage(6);
    expect(emitSpy).not.toHaveBeenCalled();
  });
});
