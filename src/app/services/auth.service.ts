import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { BehaviorSubject } from 'rxjs';
import { tap, throwError } from 'rxjs';

@Injectable({providedIn: 'root'})
export class AuthService {
  private accessTokenKey = 'accessToken';
  private refreshTokenKey = 'refreshToken';
  public user$ = new BehaviorSubject<any>(null);

  constructor(private api: ApiService) {
    const accessToken = localStorage.getItem(this.accessTokenKey);
    const refreshToken = localStorage.getItem(this.refreshTokenKey);
    if (accessToken && refreshToken) {
      this.user$.next({ accessToken, refreshToken });
    }
  }

  sendOtp(email: string) {
    return this.api.post('/auth/send-otp', { email });
  }

  verifyOtp(email: string, otp: string) {
    return this.api.post('/auth/verify-otp', { email, otp });
  }

  register(payload: {username: string, email: string, password: string, role?: string}) {
    return this.api.post('/auth/register', payload);
  }

  login(creds: {usernameOrEmail: string, password: string}) {
    return this.api.post('/auth/login', creds).pipe(
      tap((res: any) => {
        if (res.accessToken) localStorage.setItem(this.accessTokenKey, res.accessToken);
        if (res.refreshToken) localStorage.setItem(this.refreshTokenKey, res.refreshToken);
        this.user$.next({ accessToken: res.accessToken, refreshToken: res.refreshToken });
      })
    );
  }

  setAccessToken(token: string) {
    localStorage.setItem(this.accessTokenKey, token);
    this.user$.next({ ...this.user$.value, accessToken: token });
  }

  setRefreshToken(token: string) {
    localStorage.setItem(this.refreshTokenKey, token);
    this.user$.next({ ...this.user$.value, refreshToken: token });
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.accessTokenKey);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  logout() {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    this.user$.next(null);
  }

  refreshToken() {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return throwError(() => new Error('No refresh token'));
    return this.api.post('/auth/refresh', { refreshToken }).pipe(
      tap((res: any) => {
        if (res.accessToken) this.setAccessToken(res.accessToken);
        if (res.refreshToken) this.setRefreshToken(res.refreshToken);
      })
    );
  }
}
