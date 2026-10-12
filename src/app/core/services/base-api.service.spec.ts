import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';

interface TestItem {
  id: string;
  name: string;
}

@Injectable()
class ConcreteTestService extends BaseApiService<TestItem> {
  constructor() {
    super('/api/test-items');
  }
}

describe('BaseApiService', () => {
  let service: ConcreteTestService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ConcreteTestService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(ConcreteTestService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch item by id', () => {
    service.getById('ITEM-1').subscribe((item) => {
      expect(item.id).toBe('ITEM-1');
      expect(item.name).toBe('Item One');
    });

    const req = httpMock.expectOne('/api/test-items/ITEM-1');
    expect(req.request.method).toBe('GET');
    req.flush({ id: 'ITEM-1', name: 'Item One' });
  });

  it('should create new item', () => {
    service.create({ name: 'New Item' }).subscribe((created) => {
      expect(created.id).toBe('ITEM-2');
    });

    const req = httpMock.expectOne('/api/test-items');
    expect(req.request.method).toBe('POST');
    req.flush({ id: 'ITEM-2', name: 'New Item' });
  });

  it('should update item by id', () => {
    service.update('ITEM-1', { name: 'Updated' }).subscribe((updated) => {
      expect(updated.name).toBe('Updated');
    });

    const req = httpMock.expectOne('/api/test-items/ITEM-1');
    expect(req.request.method).toBe('PUT');
    req.flush({ id: 'ITEM-1', name: 'Updated' });
  });

  it('should delete item by id', () => {
    service.delete('ITEM-1').subscribe();

    const req = httpMock.expectOne('/api/test-items/ITEM-1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
