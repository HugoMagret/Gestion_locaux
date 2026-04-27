import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Room } from '../models/room.model';
import { Equipment } from '../models/equipment.model';

@Injectable({ providedIn: 'root' })
export class RoomService {
  // Simulation de données pour le front-end
  private mockRooms: Room[] = [
    new Room({
      id: '1',
      name: 'Salle de Conférence',
      max_capacity: 25,
      doors: 2,
      coordinates: { x: 50, y: 50, width: 200, height: 150 },
      equipments: [
        { id: 'e1', name: 'Projecteur 4K', serial_number: 'SN-001', equipment_type_id: 't1' }
      ],
    }),
    new Room({
      id: '2',
      name: 'Bureau Technique',
      max_capacity: 5,
      doors: 1,
      coordinates: { x: 300, y: 50, width: 100, height: 100 },
      equipments: [
        { id: 'e2', name: 'Prise RJ45', serial_number: 'A-01', equipment_type_id: 't2' }
      ],
    }),
    new Room({
      id: '3',
      name: 'Salle de Formation',
      max_capacity: 30,
      doors: 2,
      coordinates: { x: 50, y: 250, width: 250, height: 180 },
      equipments: [
        { id: 'e3', name: 'Projecteur Full HD', serial_number: 'SN-002', equipment_type_id: 't1' },
        { id: 'e4', name: 'Tableau Blanc Interactif', serial_number: 'SN-003', equipment_type_id: 't3' },
      ],
    }),
    new Room({
      id: '4',
      name: 'Open Space',
      max_capacity: 50,
      doors: 3,
      coordinates: { x: 330, y: 200, width: 300, height: 230 },
      equipments: [
        { id: 'e5', name: 'Prises RJ45 multiples', serial_number: 'MULTI', equipment_type_id: 't2' }
      ],
    }),
  ];

  getRooms(): Observable<Room[]> {
    // Retourne les données simulées sans appel HTTP
    return of(this.mockRooms);
  }
}
