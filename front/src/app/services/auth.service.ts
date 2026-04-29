import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { API_URL } from '../api.config';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.checkToken());
  public isAuthenticated$: Observable<boolean> = this.isAuthenticatedSubject.asObservable();
  
  private currentUserSubject = new BehaviorSubject<any>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

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
          localStorage.setItem('auth_token', response.token);
          localStorage.setItem('current_user', JSON.stringify(response.user));
          this.isAuthenticatedSubject.next(true);
          this.currentUserSubject.next(response.user);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
    this.isAuthenticatedSubject.next(false);
    this.currentUserSubject.next(null);
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

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }
}
