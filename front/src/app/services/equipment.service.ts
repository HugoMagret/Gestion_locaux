import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Equipment } from '../models/equipment.model';

@Injectable({ providedIn: 'root' })
export class EquipmentService {
  private mockEquipment: Equipment[] = [
    new Equipment({ id: 'e1', name: 'Projecteur 4K', serial_number: 'SN-001', equipment_type_id: 't1', room_id: '1' }),
    new Equipment({ id: 'e2', name: 'Prise RJ45', serial_number: 'A-01', equipment_type_id: 't2', room_id: '2' }),
    new Equipment({ id: 'e3', name: 'Projecteur Full HD', serial_number: 'SN-002', equipment_type_id: 't1', room_id: '3' }),
    new Equipment({ id: 'e4', name: 'Tableau Blanc Interactif', serial_number: 'SN-003', equipment_type_id: 't3', room_id: '3' }),
    new Equipment({ id: 'e5', name: 'Prises RJ45 multiples', serial_number: 'MULTI', equipment_type_id: 't2', room_id: '4' }),
  ];

  getAllEquipment(): Observable<Equipment[]> {
    return of(this.mockEquipment);
  }

  getEquipmentByRoom(roomId: string): Observable<Equipment[]> {
    return of(this.mockEquipment.filter(e => e.room_id === roomId));
  }

  addEquipment(equipment: Equipment): Observable<Equipment> {
    this.mockEquipment.push(equipment);
    return of(equipment);
  }

  updateEquipment(equipment: Equipment): Observable<Equipment> {
    const index = this.mockEquipment.findIndex(e => e.id === equipment.id);
    if (index !== -1) {
      this.mockEquipment[index] = equipment;
    }
    return of(equipment);
  }

  deleteEquipment(id: string): Observable<boolean> {
    this.mockEquipment = this.mockEquipment.filter(e => e.id !== id);
    return of(true);
  }
}
