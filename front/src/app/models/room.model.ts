import { Equipment } from './equipment.model';

export class Room {
  id: string;
  name: string;
  capacity: number;
  equipments: Equipment[];
  doors: number;
  coordinates: { x: number; y: number; width: number; height: number };

  constructor(data: any) {
    this.id = data.id;
    this.name = data.name;
    this.capacity = data.capacity;
    this.equipments = data.equipments || [];
    this.doors = data.doors || 1;
    this.coordinates = data.coordinates;
  }

  isFireSafetyCompliant(): boolean {
    return this.capacity < 20 || this.doors > 1;
  }
}
