import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapComponent } from './components/map/map';
import { FloorManagerComponent } from './components/floor-manager/floor-manager';
import { StaffListComponent } from './components/staff-list/staff-list';
import { RoomTypeManagerComponent } from './components/room-type-manager/room-type-manager';
import { EquipmentTypeManagerComponent } from './components/equipment-type-manager/equipment-type-manager';
import { RoomListComponent } from './components/room-list/room-list';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, MapComponent, FloorManagerComponent, StaffListComponent, RoomTypeManagerComponent, EquipmentTypeManagerComponent, RoomListComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  view: 'map' | 'floors' | 'staff' | 'types' | 'equipment-types' | 'rooms' = 'map';
}
