import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, map } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { RoomService } from './room.service';
import { API_URL } from '../api.config';

export interface Floor {
  id: string;
  level: number;
}

@Injectable({ providedIn: 'root' })
export class FloorService {
  private floorsSubject = new BehaviorSubject<Floor[]>([]);
  private manuallyAddedLevels = new Set<number>();

  constructor(private roomService: RoomService, private http: HttpClient) {
    this.roomService.getRooms().subscribe(rooms => {
      const uniqueFloors = new Map<number, Floor>();
      
      // Ajout dynamique basé sur les salles existantes
      rooms.forEach(room => {
        if (!uniqueFloors.has(room.floor)) {
          uniqueFloors.set(room.floor, {
            id: `floor-${room.floor}`,
            level: room.floor
          });
        }
      });

      // Ajout des étages ajoutés manuellement/importés
      this.manuallyAddedLevels.forEach(level => {
        if (!uniqueFloors.has(level)) {
          uniqueFloors.set(level, {
            id: `floor-${level}`,
            level: level
          });
        }
      });

      // S'il n'y a absolument aucune salle en BDD et aucun étage manuel, on affiche au moins le RDC pour ne pas avoir un menu vide
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
    this.manuallyAddedLevels.add(level);
    const current = this.floorsSubject.value;
    const id = `floor-${level}`;
    if (!current.find(f => f.level === level)) {
      this.floorsSubject.next([...current, { level, id }].sort((a, b) => a.level - b.level));
    }
  }

  importFloor(data: any): Observable<any> {
    return this.http.post<any>(`${API_URL}/floors/import`, data);
  }

  deleteFloor(id: string): void {
    const floorToDelete = this.floorsSubject.value.find(f => f.id === id);
    if (floorToDelete) {
      this.http.delete(`${API_URL}/floors/${floorToDelete.level}`).subscribe({
        next: () => {
          this.manuallyAddedLevels.delete(floorToDelete.level);
          this.roomService.refreshRooms(); // Ceci va aussi mettre à jour les étages !
          // On peut potentiellement appeler doorService.refreshDoors() ici
        },
        error: (err) => {
          console.error("Erreur lors de la suppression de l'étage:", err);
        }
      });
    }
  }
}