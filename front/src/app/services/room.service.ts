import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Room } from '../models/room.model';

@Injectable({ providedIn: 'root' })
export class RoomService {
  // Simulation de données enrichies pour la démo premium
  private mockRooms: Room[] = [
    new Room({
      id: '1',
      name: 'Conférence A',
      max_capacity: 25,
      doors: 2,
      coordinates: { x: 50, y: 50, width: 250, height: 180 },
      room_type: { label: 'Salle de réunion' },
      staff: [
        { first_name: 'Jean', last_name: 'Dupont' },
        { first_name: 'Marie', last_name: 'Curie' }
      ],
      equipments: [
        { name: 'Projecteur 4K Laser', serial_number: 'LX-4000' },
        { name: 'Système Audio Polycom', serial_number: 'PY-90' }
      ],
      sockets: [
        { identifier: 'ETH-01', socket_type: { label: 'Réseau' } },
        { identifier: 'ETH-02', socket_type: { label: 'Réseau' } }
      ]
    }),
    new Room({
      id: '2',
      name: 'Bureau 101',
      max_capacity: 4,
      doors: 1,
      coordinates: { x: 320, y: 50, width: 120, height: 120 },
      room_type: { label: 'Bureau' },
      staff: [
        { first_name: 'Albert', last_name: 'Einstein' }
      ],
      equipments: [
        { name: 'Station de travail Dell', serial_number: 'DELL-XP' }
      ],
      sockets: [
        { identifier: 'TEL-01', socket_type: { label: 'Téléphone' } }
      ]
    }),
    new Room({
      id: '3',
      name: 'Labo R&D',
      max_capacity: 15,
      doors: 1,
      coordinates: { x: 50, y: 250, width: 300, height: 200 },
      room_type: { label: 'Salle de formation' },
      staff: [
        { first_name: 'Ada', last_name: 'Lovelace' },
        { first_name: 'Alan', last_name: 'Turing' }
      ],
      equipments: [
        { name: 'Imprimante 3D', serial_number: 'PRUSA-MK3' },
        { name: 'Oscilloscope Digital', serial_number: 'TEK-500' }
      ],
      sockets: [
        { identifier: 'ETH-LAB-01', socket_type: { label: 'Réseau' } }
      ]
    }),
    new Room({
      id: '4',
      name: 'Espace Détente',
      max_capacity: 40,
      doors: 2,
      coordinates: { x: 370, y: 190, width: 200, height: 260 },
      room_type: { label: 'Salle de pause' },
      staff: [],
      equipments: [
        { name: 'Machine à café Jura', serial_number: 'COFFEE-1' }
      ],
      sockets: []
    }),
  ];

  getRooms(): Observable<Room[]> {
    return of(this.mockRooms);
  }
}
