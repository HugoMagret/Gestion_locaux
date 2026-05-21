import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, map } from 'rxjs';
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
    ).subscribe({
      next: (rooms) => this.roomsSubject.next(rooms)
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
    const current = this.roomsSubject.value;
    this.roomsSubject.next(current.filter(r => r.id !== id));

    this.http.delete(`${API_URL}/rooms/${id}`).subscribe({
      error: (err) => {
        console.error('Erreur lors de la suppression de la salle, rétablissement de la liste:', err);
        this.refreshRooms();
      }
    });
  }

  deleteRoomsByFloor(floor: number): void {
    const roomsToDelete = this.roomsSubject.value.filter(r => r.floor === floor);
    roomsToDelete.forEach(r => this.deleteRoom(r.id));
  }

  getRoomById(id: string): Observable<Room> {
    return this.http.get<any>(`${API_URL}/rooms/${id}`).pipe(
      map(r => new Room(r))
    );
  }

  updateRoom(roomData: any): Observable<Room> {
    return this.http.put<any>(`${API_URL}/rooms/${roomData.id}`, roomData).pipe(
      map(r => {
        const updatedRoom = new Room(r);
        const current = this.roomsSubject.value;
        const index = current.findIndex(existing => existing.id === updatedRoom.id);
        if (index !== -1) {
          current[index] = updatedRoom;
          this.roomsSubject.next([...current]);
        }
        return updatedRoom;
      })
    );
  }
}

