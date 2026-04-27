import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Equipment } from '../models/equipment.model';
import { API_URL } from '../api.config';

@Injectable({ providedIn: 'root' })
export class EquipmentService {
  constructor(private http: HttpClient) {}

  getAllEquipment(): Observable<Equipment[]> {
    return this.http.get<any[]>(`${API_URL}/equipment`).pipe(
      map(equipment => equipment.map(e => new Equipment(e)))
    );
  }

  getEquipmentByRoom(roomId: string): Observable<Equipment[]> {
    return this.getAllEquipment().pipe(
      map(equipment => equipment.filter(e => e.room_id === roomId))
    );
  }

  addEquipment(equipment: Equipment): Observable<Equipment> {
    return this.http.post<any>(`${API_URL}/equipment`, equipment).pipe(
      map(e => new Equipment(e))
    );
  }

  updateEquipment(equipment: Equipment): Observable<Equipment> {
    return this.http.put<any>(`${API_URL}/equipment/${equipment.id}`, equipment).pipe(
      map(e => new Equipment(e))
    );
  }

  deleteEquipment(id: string): Observable<boolean> {
    return this.http.delete(`${API_URL}/equipment/${id}`).pipe(
      map(() => true)
    );
  }
}

