import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { RoomService } from './room.service';

export interface Floor {
  id: string;
  building: string;
  level: number;
}

@Injectable({ providedIn: 'root' })
export class FloorService {
  private floorsSubject = new BehaviorSubject<Floor[]>([
    { id: '1', building: 'A', level: 0 },
    { id: '2', building: 'A', level: 1 },
    { id: '3', building: 'B', level: 0 },
  ]);

  constructor(private roomService: RoomService) {}

  getFloors(): Observable<Floor[]> {
    return this.floorsSubject.asObservable();
  }

  addFloor(floor: Omit<Floor, 'id'>): void {
    const current = this.floorsSubject.value;
    const newFloor = { ...floor, id: Math.random().toString(36).substr(2, 9) };
    this.floorsSubject.next([...current, newFloor]);
  }

  deleteFloor(id: string): void {
    const current = this.floorsSubject.value;
    const floorToDelete = current.find(f => f.id === id);
    if (floorToDelete) {
      this.roomService.deleteRoomsByFloor(floorToDelete.building, floorToDelete.level);
      this.floorsSubject.next(current.filter(f => f.id !== id));
    }
  }
}
