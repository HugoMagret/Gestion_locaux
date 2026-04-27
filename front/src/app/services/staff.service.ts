import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Staff } from '../models/staff.model';

@Injectable({ providedIn: 'root' })
export class StaffService {
  private mockStaff: Staff[] = [
    new Staff({ id: 's1', first_name: 'Jean', last_name: 'Dupont', room_id: '1' }),
    new Staff({ id: 's2', first_name: 'Marie', last_name: 'Curie', room_id: '1' }),
    new Staff({ id: 's3', first_name: 'Albert', last_name: 'Einstein', room_id: '3' }),
    new Staff({ id: 's4', first_name: 'Isaac', last_name: 'Newton', room_id: '4' }),
    new Staff({ id: 's5', first_name: 'Ada', last_name: 'Lovelace', room_id: '2' }),
  ];

  getStaff(): Observable<Staff[]> {
    return of(this.mockStaff);
  }

  getStaffByRoom(roomId: string): Observable<Staff[]> {
    return of(this.mockStaff.filter(s => s.room_id === roomId));
  }

  addStaff(staff: Staff): Observable<Staff> {
    this.mockStaff.push(staff);
    return of(staff);
  }

  updateStaff(staff: Staff): Observable<Staff> {
    const index = this.mockStaff.findIndex(s => s.id === staff.id);
    if (index !== -1) {
      this.mockStaff[index] = staff;
    }
    return of(staff);
  }

  deleteStaff(id: string): Observable<boolean> {
    this.mockStaff = this.mockStaff.filter(s => s.id !== id);
    return of(true);
  }
}
