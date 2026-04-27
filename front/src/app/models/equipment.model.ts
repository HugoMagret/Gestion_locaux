import { EquipmentType } from './equipment-type.model';

export class Equipment {
  id: string;
  name: string;
  serial_number?: string;
  equipment_type_id: string;
  equipment_type?: EquipmentType;
  room_id: string;

  constructor(data: any) {
    this.id = data.id;
    this.name = data.name;
    this.serial_number = data.serial_number;
    this.equipment_type_id = data.equipment_type_id;
    this.room_id = data.room_id;
    if (data.equipment_type) {
      this.equipment_type = new EquipmentType(data.equipment_type);
    }
  }
}
