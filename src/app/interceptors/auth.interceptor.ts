import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  console.log('[AuthInterceptor] Interceptor called');
  const auth = inject(AuthService);
  console.log('[AuthInterceptor] AuthService injected:', !!auth);
  const token = auth.getAccessToken();
  const refreshToken = auth.getRefreshToken();
  console.log('[AuthInterceptor] accessToken before request:', token);
  console.log('[AuthInterceptor] refreshToken before request:', refreshToken);
  const isAuthEndpoint = req.url.includes('/auth/');
  console.log('[AuthInterceptor] Request URL:', req.url);
  console.log('[AuthInterceptor] isAuthEndpoint:', isAuthEndpoint);

  let modifiedReq = req;
  if (token && !isAuthEndpoint) {
    console.log('[AuthInterceptor] Adding Authorization header');
    modifiedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  } else {
    console.log('[AuthInterceptor] Not adding Authorization header');
  }

  console.log('[AuthInterceptor] Passing request to next handler');
  return next(modifiedReq).pipe(
    catchError((err: any) => {
      console.log('[AuthInterceptor] Error caught:', err);
      console.log('[AuthInterceptor] Error status:', err?.status);
      console.log('[AuthInterceptor] isAuthEndpoint in error:', isAuthEndpoint);
      if ((err.status === 401 || err.status === 403) && !isAuthEndpoint) {
        console.log(`[AuthInterceptor] ${err.status} detected, attempting refresh...`);
        console.warn(`[AuthInterceptor] ${err.status} detected, attempting refresh...`);
        return auth.refreshToken().pipe(
          switchMap(() => {
            console.log('[AuthInterceptor] Token refresh successful');
            const newToken = auth.getAccessToken();
            const newRefreshToken = auth.getRefreshToken();
            console.log('[AuthInterceptor] accessToken after refresh:', newToken);
            console.log('[AuthInterceptor] refreshToken after refresh:', newRefreshToken);
            const retriedReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newToken}`
              }
            });
            console.log('[AuthInterceptor] Retrying request with new token');
            return next(retriedReq);
          }),
          catchError((refreshErr) => {
            if (refreshErr.status === 401) {
              console.log(refreshErr);
    auth.logout();
  }
            console.log('[AuthInterceptor] Token refresh failed:', refreshErr);
            // Only show session expired alert for true auth errors
            const authErrorMsg = (refreshErr?.error?.error || refreshErr?.message || '').toLowerCase();
            if (
              authErrorMsg.includes('token') ||
              authErrorMsg.includes('expired') ||
              authErrorMsg.includes('unauthorized') ||
              authErrorMsg.includes('invalid')
            ) {
              alert('Your session has expired. Please log in.');
            } else {
              alert('An error occurred: ' + (refreshErr?.error?.error || refreshErr?.message || refreshErr));
            }
            return throwError(() => err);
          })
        );
      }
      console.log('[AuthInterceptor] Propagating error');
      return throwError(() => err);
    })
  );
};
