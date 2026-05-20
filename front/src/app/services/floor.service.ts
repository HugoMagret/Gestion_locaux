import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, map } from 'rxjs';
import { RoomService } from './room.service';

export interface Floor {
  id: string;
  level: number;
}

@Injectable({ providedIn: 'root' })
export class FloorService {
  private floorsSubject = new BehaviorSubject<Floor[]>([]);

  constructor(private roomService: RoomService) {
    this.roomService.getRooms().subscribe(rooms => {
      const uniqueFloors = new Map<number, Floor>();
      
      // Ajout dynamique basé UNIQUEMENT sur les salles existantes
      rooms.forEach(room => {
        if (!uniqueFloors.has(room.floor)) {
          uniqueFloors.set(room.floor, {
            id: `floor-${room.floor}`,
            level: room.floor
          });
        }
      });

      // S'il n'y a absolument aucune salle en BDD, on affiche au moins le RDC pour ne pas avoir un menu vide
      if (uniqueFloors.size === 0) {
        uniqueFloors.set(0, { id: 'floor-0', level: 0 });
      }

      // On trie les étages du plus bas au plus haut
      this.floorsSubject.next(Array.from(uniqueFloors.values()).sort((a, b) => a.level - b.level));
    });
  }

  getFloors(): Observable<Floor[]> {
    return this.floorsSubject.asObservable();
  }

  addFloor(level: number): void {
    const current = this.floorsSubject.value;
    const id = `floor-${level}`;
    if (!current.find(f => f.level === level)) {
      this.floorsSubject.next([...current, { level, id }].sort((a, b) => a.level - b.level));
    }
  }

  deleteFloor(id: string): void {
    const floorToDelete = this.floorsSubject.value.find(f => f.id === id);
    if (floorToDelete) {
      this.roomService.deleteRoomsByFloor(floorToDelete.level);
    }
  }
}