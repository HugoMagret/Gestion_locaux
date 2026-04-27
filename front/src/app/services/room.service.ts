import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, map, tap } from 'rxjs';
import { Room } from '../models/room.model';
import { API_URL } from '../api.config';

@Injectable({ providedIn: 'root' })
export class RoomService {
  private roomsSubject = new BehaviorSubject<Room[]>([]);

  constructor(private http: HttpClient) {
    this.refreshRooms();
  }

  refreshRooms(): void {
    this.http.get<any[]>(`${API_URL}/rooms`).pipe(
      map(rooms => rooms.map(r => new Room(r)))
    ).subscribe(rooms => {
      this.roomsSubject.next(rooms);
    });
  }

  getRooms(): Observable<Room[]> {
    return this.roomsSubject.asObservable();
  }

  addRoom(roomData: any): void {
    this.http.post<any>(`${API_URL}/rooms`, roomData).pipe(
      map(r => new Room(r))
    ).subscribe(newRoom => {
      const current = this.roomsSubject.value;
      this.roomsSubject.next([...current, newRoom]);
    });
  }

  deleteRoom(id: string): void {
    this.http.delete(`${API_URL}/rooms/${id}`).subscribe(() => {
      const current = this.roomsSubject.value;
      this.roomsSubject.next(current.filter(r => r.id !== id));
    });
  }

  deleteRoomsByFloor(building: string, floor: number): void {
    // Note: Backend doesn't have a bulk delete by floor.
    // For now, we filter locally and you might want to implement it in the back.
    const roomsToDelete = this.roomsSubject.value.filter(r => r.building === building && r.floor === floor);
    roomsToDelete.forEach(r => this.deleteRoom(r.id));
  }
}

