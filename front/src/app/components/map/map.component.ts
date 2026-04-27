import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Room } from '../../models/room.model';
import { RoomService } from '../../services/room.service';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
})
export class MapComponent implements OnInit {
  allRooms: Room[] = [];
  filteredRooms: Room[] = [];
  selectedRoom: Room | null = null;

  // Navigation state
  selectedBuilding = 'A';
  selectedFloor = 0;

  // Filters / Layers state
  showSockets = false;
  showEquipment = false;
  showStaff = false;

  buildings = ['A', 'B'];
  floors = [0, 1];

  constructor(private roomService: RoomService) {}

  ngOnInit(): void {
    this.loadRooms();
  }

  loadRooms(): void {
    this.roomService.getRooms().subscribe({
      next: (data) => {
        this.allRooms = data;
        this.applyFilters();
      },
      error: (error) => {
        console.error('Error loading rooms:', error);
      },
    });
  }

  applyFilters(): void {
    this.filteredRooms = this.allRooms.filter(
      (r) => r.building === this.selectedBuilding && r.floor === this.selectedFloor
    );
    // Reset selected room if it's not in the new view
    if (this.selectedRoom && (this.selectedRoom.building !== this.selectedBuilding || this.selectedRoom.floor !== this.selectedFloor)) {
      this.selectedRoom = null;
    }
  }

  selectBuilding(building: string): void {
    this.selectedBuilding = building;
    this.applyFilters();
  }

  selectFloor(floor: number): void {
    this.selectedFloor = floor;
    this.applyFilters();
  }

  selectRoom(room: Room): void {
    this.selectedRoom = room;
  }

  onMapClick(event: MouseEvent): void {
    this.selectedRoom = null;
  }

  toggleLayer(layer: 'sockets' | 'equipment' | 'staff'): void {
    if (layer === 'sockets') this.showSockets = !this.showSockets;
    if (layer === 'equipment') this.showEquipment = !this.showEquipment;
    if (layer === 'staff') this.showStaff = !this.showStaff;
  }

  addReservation(room: Room): void {
    console.log('Managing room:', room.name);
  }
}
