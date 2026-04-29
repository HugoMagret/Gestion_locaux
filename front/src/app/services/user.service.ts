import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../api.config';
import { AuthService } from './auth.service';

export interface User {
  id?: string;
  login: string;
  password?: string;
  is_admin: boolean;
  last_connection?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private http: HttpClient, private authService: AuthService) {}

  private get headers() {
    return { 'X-Is-Admin': this.authService.isAdmin.toString() };
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${API_URL}/users`);
  }

  addUser(user: User): Observable<User> {
    return this.http.post<User>(`${API_URL}/users`, user, { headers: this.headers });
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${API_URL}/users/${id}`, { headers: this.headers });
  }
}
