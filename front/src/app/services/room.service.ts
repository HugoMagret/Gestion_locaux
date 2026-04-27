import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { Room } from '../models/room.model';

@Injectable({ providedIn: 'root' })
export class RoomService {
  private roomsSubject = new BehaviorSubject<Room[]>([
    // Bâtiment A - RDC
    new Room({
      id: 'A001', name: 'Conférence A', building: 'A', floor: 0, max_capacity: 25, doors: 2,
      start_x: 50, start_y: 50, x: 250, y: 150,
      room_type: { label: 'Salle de réunion' },
      staff: [{ first_name: 'Jean', last_name: 'Dupont' }],
      equipments: [{ name: 'Projecteur 4K' }],
      sockets: [{ identifier: 'ETH-01' }]
    }),
    new Room({
      id: 'A002', name: 'Bureau 101', building: 'A', floor: 0, max_capacity: 4, doors: 1,
      start_x: 320, start_y: 50, x: 120, y: 100,
      room_type: { label: 'Bureau' },
      staff: [{ first_name: 'Albert', last_name: 'Einstein' }],
      equipments: [], sockets: [{ identifier: 'TEL-01' }]
    }),
    // Bâtiment A - Etage 1
    new Room({
      id: 'A101', name: 'Labo R&D', building: 'A', floor: 1, max_capacity: 15, doors: 1,
      start_x: 50, start_y: 50, x: 300, y: 200,
      room_type: { label: 'Laboratoire' },
      staff: [{ first_name: 'Ada', last_name: 'Lovelace' }],
      equipments: [{ name: 'Imprimante 3D' }],
      sockets: []
    }),
    new Room({
      id: 'A102', name: 'Cafétéria', building: 'A', floor: 1, max_capacity: 50, doors: 2,
      start_x: 370, start_y: 50, x: 200, y: 200,
      room_type: { label: 'Salle de pause' },
      staff: [], equipments: [{ name: 'Machine à café' }], sockets: []
    })
  ]);

  getRooms(): Observable<Room[]> {
    return this.roomsSubject.asObservable();
  }

  addRoom(roomData: any): void {
    const current = this.roomsSubject.value;
    const newRoom = new Room(roomData);
    this.roomsSubject.next([...current, newRoom]);
  }

  deleteRoomsByFloor(building: string, floor: number): void {
    const current = this.roomsSubject.value;
    this.roomsSubject.next(current.filter(r => !(r.building === building && r.floor === floor)));
  }
}
