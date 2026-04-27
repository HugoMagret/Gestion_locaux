import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { RoomType } from '../models/room-type.model';
import { EquipmentType } from '../models/equipment-type.model';
import { SocketType } from '../models/socket-type.model';

@Injectable({ providedIn: 'root' })
export class ReferenceService {
  private mockRoomTypes: RoomType[] = [
    new RoomType({ id: 'rt1', label: 'Bureau' }),
    new RoomType({ id: 'rt2', label: 'Salle de classe' }),
    new RoomType({ id: 'rt3', label: 'Salle de pause' }),
    new RoomType({ id: 'rt4', label: 'Salle de réunion' }),
  ];

  private mockEquipmentTypes: EquipmentType[] = [
    new EquipmentType({ id: 't1', label: 'Vidéoprojecteur' }),
    new EquipmentType({ id: 't2', label: 'Prise Réseau' }),
    new EquipmentType({ id: 't3', label: 'Tableau Blanc' }),
  ];

  private mockSocketTypes: SocketType[] = [
    new SocketType({ id: 'st1', label: 'Réseau' }),
    new SocketType({ id: 'st2', label: 'Téléphonique' }),
  ];

  getRoomTypes(): Observable<RoomType[]> {
    return of(this.mockRoomTypes);
  }

  getEquipmentTypes(): Observable<EquipmentType[]> {
    return of(this.mockEquipmentTypes);
  }

  getSocketTypes(): Observable<SocketType[]> {
    return of(this.mockSocketTypes);
  }
}
