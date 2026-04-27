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
      capacity: 25,
      doors: 2,
      coordinates: { x: 50, y: 50, width: 200, height: 150 },
      equipments: [new Equipment('VIDEO_PROJ', 'Projecteur 4K')],
    }),
    new Room({
      id: '2',
      name: 'Bureau Technique',
      capacity: 5,
      doors: 1,
      coordinates: { x: 300, y: 50, width: 100, height: 100 },
      equipments: [new Equipment('PRISE_RESEAU', 'Prise RJ45', 'A-01')],
    }),
    new Room({
      id: '3',
      name: 'Salle de Formation',
      capacity: 30,
      doors: 2,
      coordinates: { x: 50, y: 250, width: 250, height: 180 },
      equipments: [
        new Equipment('VIDEO_PROJ', 'Projecteur Full HD'),
        new Equipment('TABLEAU', 'Tableau Blanc Interactif'),
      ],
    }),
    new Room({
      id: '4',
      name: 'Open Space',
      capacity: 50,
      doors: 3,
      coordinates: { x: 330, y: 200, width: 300, height: 230 },
      equipments: [new Equipment('PRISE_RESEAU', 'Prises RJ45 multiples')],
    }),
  ];

  getRooms(): Observable<Room[]> {
    // Retourne les données simulées sans appel HTTP
    return of(this.mockRooms);
  }
}
