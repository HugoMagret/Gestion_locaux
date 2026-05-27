import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, map } from 'rxjs';
import { API_URL } from '../api.config';

export interface Door {
  id: string;
  floor: number;
  coordinates: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

@Injectable({ providedIn: 'root' })
export class DoorService {
  private doorsSubject = new BehaviorSubject<Door[]>([]);

  constructor(private http: HttpClient) {}

  getDoorsByFloor(floor: number): Observable<Door[]> {
    return this.http.get<any[]>(`${API_URL}/doors?floor=${floor}`).pipe(
      map(doors => doors.map(d => ({
        id: d.id,
        floor: d.floor,
        coordinates: typeof d.coordinates === 'string' ? JSON.parse(d.coordinates) : d.coordinates
      })))
    );
  }

  fetchDoorsByFloor(floor: number): void {
    this.getDoorsByFloor(floor).subscribe({
      next: (doors) => this.doorsSubject.next(doors)
    });
  }

  getDoors(): Observable<Door[]> {
    return this.doorsSubject.asObservable();
  }
}
