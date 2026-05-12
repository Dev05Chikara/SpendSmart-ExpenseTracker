import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError, map } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../models/models';
import { environment } from '../../../environments/environment';
import { MOCK_USER } from '../mock/mock-data';
import { enableDemoMode, disableDemoMode } from '../interceptors/mock.interceptor';
import { mapAuthResponse, mapUser } from './backend-response';

interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  role: string;
  currency: string;
  exp: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'ss_token';
  private readonly USER_KEY  = 'ss_user';

  currentUser = signal<User | null>(null);
  isLoggedIn  = signal<boolean>(false);

  constructor(private http: HttpClient, private router: Router) {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const user  = localStorage.getItem(this.USER_KEY);
    if (token && user && !this.isTokenExpired(token)) {
      this.currentUser.set(JSON.parse(user));
      this.isLoggedIn.set(true);
    } else {
      this.clearStorage();
    }
  }

  login(req: LoginRequest): Observable<AuthResponse> {
    return this.http.post<any>(`${environment.apiGateway}/users/login`, req).pipe(
      map(response => mapAuthResponse(response)),
      tap(res => this.handleAuthSuccess(res)),
      catchError(this.handleError)
    );
  }

  register(req: RegisterRequest): Observable<User> {
    return this.http.post<any>(`${environment.apiGateway}/users/register`, req).pipe(
      map(response => mapUser(response.data ?? response.Data ?? response)),
      catchError(this.handleError)
    );
  }

  googleOAuth(token: string): Observable<AuthResponse> {
    return this.http.post<any>(`${environment.apiGateway}/users/google-auth`, { idToken: token }).pipe(
      map(response => mapAuthResponse(response)),
      tap(res => this.handleAuthSuccess(res)),
      catchError(this.handleError)
    );
  }

  getProfile(): Observable<User> {
    return this.http.get<any>(`${environment.apiGateway}/users/profile`).pipe(
      map(response => mapUser(response.data ?? response.Data ?? response))
    );
  }

  updateProfile(data: Partial<User>): Observable<User> {
    return this.http.put<any>(`${environment.apiGateway}/users/update-profile`, {
      fullName: data.name,
      currency: data.currency,
    }).pipe(
      map(response => mapUser(response.data ?? response.Data ?? response)),
      tap(user => {
        this.currentUser.set(user);
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      })
    );
  }

  logout(): void {
    disableDemoMode();
    this.clearStorage();
    this.currentUser.set(null);
    this.isLoggedIn.set(false);
    this.router.navigate(['/auth/login']);
  }

  /** Bypass backend — load mock user and enable demo mode interceptor */
  demoLogin(): void {
    enableDemoMode();
    const fakeToken = 'demo.' + btoa(JSON.stringify({ exp: Date.now() / 1000 + 86400 })) + '.signature';
    localStorage.setItem(this.TOKEN_KEY, fakeToken);
    localStorage.setItem(this.USER_KEY, JSON.stringify(MOCK_USER));
    this.currentUser.set(MOCK_USER);
    this.isLoggedIn.set(true);
    this.router.navigate(['/dashboard']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isAdmin(): boolean {
    return this.currentUser()?.role === 'Admin';
  }

  private handleAuthSuccess(res: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, res.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(res.user));
    this.currentUser.set(res.user);
    this.isLoggedIn.set(true);
  }

  private clearStorage(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  private isTokenExpired(token: string): boolean {
    if (token.startsWith('demo.')) return false;   // demo token never expires
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      return decoded.exp * 1000 < Date.now();
    } catch { return true; }
  }

  private handleError(err: any): Observable<never> {
    const msg = err?.error?.message || 'An error occurred';
    return throwError(() => new Error(msg));
  }
}
