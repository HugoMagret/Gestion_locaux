import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Staff } from '../models/staff.model';
import { API_URL } from '../api.config';

@Injectable({ providedIn: 'root' })
export class StaffService {
  constructor(private http: HttpClient) {}

  getStaff(): Observable<Staff[]> {
    return this.http.get<any[]>(`${API_URL}/staff`).pipe(
      map(staff => staff.map(s => new Staff(s)))
    );
  }

  getStaffByRoom(roomId: string): Observable<Staff[]> {
    return this.getStaff().pipe(
      map(staff => staff.filter(s => s.room_id === roomId))
    );
  }

  addStaff(staff: Staff): Observable<Staff> {
    return this.http.post<any>(`${API_URL}/staff`, staff).pipe(
      map(s => new Staff(s))
    );
  }

  updateStaff(staff: Staff): Observable<Staff> {
    return this.http.put<any>(`${API_URL}/staff/${staff.id}`, staff).pipe(
      map(s => new Staff(s))
    );
  }

  deleteStaff(id: string): Observable<boolean> {
    return this.http.delete(`${API_URL}/staff/${id}`).pipe(
      map(() => true)
    );
  }
}

