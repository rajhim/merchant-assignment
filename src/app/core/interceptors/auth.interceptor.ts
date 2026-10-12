import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

let isRefreshing = false;
let refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const resetInterceptorState = () => {
  isRefreshing = false;
  refreshTokenSubject = new BehaviorSubject<string | null>(null);
};

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);

  if (req.url.includes('/api/auth/refresh') || req.url.includes('/api/auth/login')) {
    return next(req);
  }

  const token = authService.getAccessToken();
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        return handle401Error(authReq, next, authService);
      }
      return throwError(() => error);
    })
  );
};

function handle401Error(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService
): Observable<HttpEvent<unknown>> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.refreshToken().pipe(
      switchMap((tokens) => {
        isRefreshing = false;
        refreshTokenSubject.next(tokens.accessToken);
        const retryReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${tokens.accessToken}`
          }
        });
        return next(retryReq);
      }),
      catchError((refreshErr) => {
        isRefreshing = false;
        return throwError(() => refreshErr);
      })
    );
  }

  return refreshTokenSubject.pipe(
    filter((token): token is string => token !== null),
    take(1),
    switchMap((newToken) => {
      const retryReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${newToken}`
        }
      });
      return next(retryReq);
    })
  );
}
