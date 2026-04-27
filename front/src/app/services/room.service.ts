import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Room } from '../models/room.model';

@Injectable({ providedIn: 'root' })
export class RoomService {
  private mockRooms: Room[] = [
    // Bâtiment A - RDC
    new Room({
      id: 'A001', name: 'Conférence A', building: 'A', floor: 0, max_capacity: 25, doors: 2,
      coordinates: { x: 50, y: 50, width: 250, height: 150 },
      room_type: { label: 'Salle de réunion' },
      staff: [{ first_name: 'Jean', last_name: 'Dupont' }],
      equipments: [{ name: 'Projecteur 4K' }],
      sockets: [{ identifier: 'ETH-01' }]
    }),
    new Room({
      id: 'A002', name: 'Bureau 101', building: 'A', floor: 0, max_capacity: 4, doors: 1,
      coordinates: { x: 320, y: 50, width: 120, height: 100 },
      room_type: { label: 'Bureau' },
      staff: [{ first_name: 'Albert', last_name: 'Einstein' }],
      equipments: [], sockets: [{ identifier: 'TEL-01' }]
    }),
    // Bâtiment A - Etage 1
    new Room({
      id: 'A101', name: 'Labo R&D', building: 'A', floor: 1, max_capacity: 15, doors: 1,
      coordinates: { x: 50, y: 50, width: 300, height: 200 },
      room_type: { label: 'Laboratoire' },
      staff: [{ first_name: 'Ada', last_name: 'Lovelace' }],
      equipments: [{ name: 'Imprimante 3D' }],
      sockets: []
    }),
    new Room({
      id: 'A102', name: 'Cafétéria', building: 'A', floor: 1, max_capacity: 50, doors: 2,
      coordinates: { x: 370, y: 50, width: 200, height: 200 },
      room_type: { label: 'Salle de pause' },
      staff: [], equipments: [{ name: 'Machine à café' }], sockets: []
    }),
    // Bâtiment B - RDC
    new Room({
      id: 'B001', name: 'Amphi B', building: 'B', floor: 0, max_capacity: 100, doors: 3,
      coordinates: { x: 50, y: 50, width: 400, height: 300 },
      room_type: { label: 'Salle de classe' },
      staff: [{ first_name: 'Isaac', last_name: 'Newton' }],
      equipments: [{ name: 'Projecteur Géant' }],
      sockets: [{ identifier: 'ETH-B-01' }]
    }),
    new Room({
      id: 'B002', name: 'Stockage', building: 'B', floor: 0, max_capacity: 2, doors: 1,
      coordinates: { x: 470, y: 50, width: 100, height: 100 },
      room_type: { label: 'Bureau' },
      staff: [], equipments: [{ name: 'Rayonnages' }], sockets: []
    })
  ];

  getRooms(): Observable<Room[]> {
    return of(this.mockRooms);
  }
}
