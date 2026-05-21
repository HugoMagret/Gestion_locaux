import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';
import { RoomType } from '../models/room-type.model';
import { EquipmentType } from '../models/equipment-type.model';
import { SocketType } from '../models/socket-type.model';
import { API_URL } from '../api.config';

@Injectable({ providedIn: 'root' })
export class ReferenceService {
  constructor(private http: HttpClient) {}

  getRoomTypes(): Observable<RoomType[]> {
    return this.http.get<any[]>(`${API_URL}/types/room`).pipe(
      map(types => types.map(t => new RoomType(t)))
    );
  }

  addRoomType(label: string, color?: string): Observable<RoomType> {
    return this.http.post<any>(`${API_URL}/types/room`, { label, color }).pipe(
      map(t => new RoomType(t))
    );
  }

  deleteRoomType(id: string): Observable<void> {
    return this.http.delete<void>(`${API_URL}/types/room/${id}`);
  }

  getEquipmentTypes(): Observable<EquipmentType[]> {
    return this.http.get<any[]>(`${API_URL}/types/equipment`).pipe(
      map(types => types.map(t => new EquipmentType(t)))
    );
  }

  addEquipmentType(label: string): Observable<EquipmentType> {
    return this.http.post<any>(`${API_URL}/types/equipment`, { label }).pipe(
      map(t => new EquipmentType(t))
    );
  }

  deleteEquipmentType(id: string): Observable<void> {
    return this.http.delete<void>(`${API_URL}/types/equipment/${id}`);
  }

  getSocketTypes(): Observable<SocketType[]> {
    return this.http.get<any[]>(`${API_URL}/types/socket`).pipe(
      map(types => types.map(t => new SocketType(t)))
    );
  }
}

