import { Equipment } from './equipment.model';
import { RoomType } from './room-type.model';
import { Staff } from './staff.model';
import { Socket } from './socket.model';

export class Room {
  id: string;
  name: string;
  max_capacity: number;
  room_type_id: string;
  room_type?: RoomType;
  equipments: Equipment[];
  staff: Staff[];
  sockets: Socket[];
  
  // UI related fields (keep existing ones)
  doors: number;
  coordinates: { x: number; y: number; width: number; height: number };

  constructor(data: any) {
    this.id = data.id;
    this.name = data.name;
    this.max_capacity = data.max_capacity || data.capacity; // Support both names during transition
    this.room_type_id = data.room_type_id;
    
    if (data.room_type) {
      this.room_type = new RoomType(data.room_type);
    }

    this.equipments = (data.equipments || []).map((e: any) => new Equipment(e));
    this.staff = (data.staff || []).map((s: any) => new Staff(s));
    this.sockets = (data.sockets || []).map((s: any) => new Socket(s));
    
    this.doors = data.doors || 1;
    this.coordinates = data.coordinates;
  }

  isFireSafetyCompliant(): boolean {
    return this.max_capacity < 20 || this.doors > 1;
  }
}
