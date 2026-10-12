import { inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export abstract class BaseApiService<T> {
  protected readonly http = inject(HttpClient);

  constructor(protected readonly basePath: string) {}

  getAll(params?: HttpParams): Observable<T[]> {
    return this.http.get<T[]>(this.basePath, { params });
  }

  getById(id: string): Observable<T> {
    return this.http.get<T>(`${this.basePath}/${id}`);
  }

  create(data: Partial<T>): Observable<T> {
    return this.http.post<T>(this.basePath, data);
  }

  update(id: string, data: Partial<T>): Observable<T> {
    return this.http.put<T>(`${this.basePath}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.basePath}/${id}`);
  }
}
