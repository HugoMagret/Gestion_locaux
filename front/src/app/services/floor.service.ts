import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, map } from 'rxjs';
import { RoomService } from './room.service';

export interface Floor {
  id: string;
  building: string;
  level: number;
}

@Injectable({ providedIn: 'root' })
export class FloorService {
  private floorsSubject = new BehaviorSubject<Floor[]>([]);

  constructor(private roomService: RoomService) {
    this.roomService.getRooms().subscribe(rooms => {
      const uniqueFloors = new Map<string, Floor>();
      
      // Always include some defaults if we want, or just derive
      rooms.forEach(room => {
        const key = `${room.building}-${room.floor}`;
        if (!uniqueFloors.has(key)) {
          uniqueFloors.set(key, {
            id: key,
            building: room.building || 'A',
            level: room.floor
          });
        }
      });

      // If no rooms, we might want to keep the "initial" ones for the UI to work if it's a new DB
      if (uniqueFloors.size === 0) {
        uniqueFloors.set('A-0', { id: 'A-0', building: 'A', level: 0 });
      }

      this.floorsSubject.next(Array.from(uniqueFloors.values()));
    });
  }

  getFloors(): Observable<Floor[]> {
    return this.floorsSubject.asObservable();
  }

  addFloor(floor: Omit<Floor, 'id'>): void {
    const current = this.floorsSubject.value;
    const id = `${floor.building}-${floor.level}`;
    if (!current.find(f => f.id === id)) {
      this.floorsSubject.next([...current, { ...floor, id }]);
    }
  }

  deleteFloor(id: string): void {
    const floorToDelete = this.floorsSubject.value.find(f => f.id === id);
    if (floorToDelete) {
      this.roomService.deleteRoomsByFloor(floorToDelete.building, floorToDelete.level);
      // The floorsSubject will be updated automatically by the roomService subscription
    }
  }
}

