import { Equipment } from './equipment.model';
import { RoomType } from './room-type.model';
import { Staff } from './staff.model';
import { Socket } from './socket.model';

export class Room {
  id: string;
  name: string;
  max_capacity: number;
  room_type_id: string;
  doors: number;
  floor: number;
  coordinates: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  color: string;
  
  // Joined fields from API
  room_type_label?: string;
  staff: Staff[];
  equipments: Equipment[];
  sockets: Socket[];

  constructor(data: any) {
    this.id = data.id;
    this.name = data.name;
    this.max_capacity = data.max_capacity;
    this.room_type_id = data.room_type_id;
    this.doors = data.doors || 1;
    this.floor = data.floor !== undefined ? data.floor : 0;
    this.color = data.color || '#3498db';
    this.room_type_label = data.room_type_label;
    
    // Coordinates mapping
    if (data.coordinates) {
      this.coordinates = {
        x: data.coordinates.x || 0,
        y: data.coordinates.y || 0,
        width: data.coordinates.width || 100,
        height: data.coordinates.height || 100
      };
    } else {
      this.coordinates = { x: 0, y: 0, width: 100, height: 100 };
    }

    this.staff = (data.staff || []).map((s: any) => new Staff(s));
    this.equipments = (data.equipments || []).map((e: any) => new Equipment(e));
    this.sockets = (data.sockets || []).map((so: any) => new Socket(so));
  }
}
