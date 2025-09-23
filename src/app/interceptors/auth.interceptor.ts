import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getAccessToken();
  const refreshToken = auth.getRefreshToken();
  // Debug: Log tokens before request
  console.log('[AuthInterceptor] accessToken before request:', token);
  console.log('[AuthInterceptor] refreshToken before request:', refreshToken);
  // Skip adding token for auth endpoints to avoid issues with login/register
  const isAuthEndpoint = req.url.includes('/auth/');

  let modifiedReq = req;
  if (token && !isAuthEndpoint) {
    modifiedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(modifiedReq).pipe(
    catchError((err: any) => {
      if ((err.status === 401 || err.status === 403) && !isAuthEndpoint) {
        console.warn(`[AuthInterceptor] ${err.status} detected, attempting refresh...`);
        // Try to refresh token on 401 Unauthorized or 403 Forbidden
        return auth.refreshToken().pipe(
          switchMap(() => {
            const newToken = auth.getAccessToken();
            const newRefreshToken = auth.getRefreshToken();
            // Debug: Log tokens after refresh
            console.log('[AuthInterceptor] accessToken after refresh:', newToken);
            console.log('[AuthInterceptor] refreshToken after refresh:', newRefreshToken);
            const retriedReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newToken}`
              }
            });
            return next(retriedReq);
          }),
          catchError(() => {
            auth.logout();
            alert('Your session has expired. Please log in again.');
            return throwError(() => err);
          })
        );
      }
      // For 403, just propagate the error (e.g., wrong password)
      return throwError(() => err);
    })
  );
};
