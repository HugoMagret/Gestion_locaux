import { Injectable, NgZone, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { API_URL } from '../api.config';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private zone = inject(NgZone);

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.checkToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  
  private currentUserSubject = new BehaviorSubject<any>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  private checkToken(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  private getUserFromStorage(): any {
    const user = localStorage.getItem('current_user');
    return user ? JSON.parse(user) : null;
  }

  login(login: string, password: string): Observable<any> {
    return this.http.post<any>(`${API_URL}/auth/login`, { login, password }).pipe(
      tap(response => {
        if (response.success) {
          this.zone.run(() => {
            localStorage.setItem('auth_token', response.token);
            localStorage.setItem('current_user', JSON.stringify(response.user));
            this.isAuthenticatedSubject.next(true);
            this.currentUserSubject.next(response.user);
          });
        }
      })
    );
  }

  logout(): void {
    this.zone.run(() => {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('current_user');
      this.isAuthenticatedSubject.next(false);
      this.currentUserSubject.next(null);
    });
  }

  get isAdmin(): boolean {
    return this.currentUserSubject.value?.is_admin || false;
  }

  get currentUser(): any {
    return this.currentUserSubject.value;
  }

  changePassword(newPassword: string): Observable<any> {
    const userId = this.currentUser?.id;
    return this.http.post<any>(`${API_URL}/auth/change-password`, { userId, newPassword });
  }

  verifyCurrentPassword(password: string): Observable<any> {
    const userId = this.currentUser?.id;
    return this.http.post<any>(`${API_URL}/auth/verify-password`, { userId, password });
  }

  logoutBackend(userId?: string): Observable<any> {
    return this.http.post<any>(`${API_URL}/auth/logout`, { userId: userId || this.currentUser?.id });
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }
}
