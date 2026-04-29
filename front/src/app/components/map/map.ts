import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Room } from '../../models/room.model';
import { RoomService } from '../../services/room.service';
import { FloorService } from '../../services/floor.service';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './map.html',
  styleUrls: ['./map.css'],
})
export class MapComponent implements OnInit {
  @Output() roomSelected = new EventEmitter<string>();
  allRooms: Room[] = [];
  filteredRooms: Room[] = [];
  selectedRoom: Room | null = null;
  isEditing = false;
  editRoomData: any = {};

  // Navigation state
  selectedFloor = 0;

  // Filters / Layers state
  showResearchers = true;
  showEquipment = true;
  showSockets = true;

  availableFloors: number[] = [];

  constructor(
    private roomService: RoomService,
    private floorService: FloorService
  ) {}

  ngOnInit(): void {
    this.loadRooms();
    this.loadFloors();
  }

  loadRooms(): void {
    this.roomService.getRooms().subscribe({
      next: (data) => {
        this.allRooms = data;
        this.applyFilters();
      },
    });
  }

  loadFloors(): void {
    this.floorService.getFloors().subscribe(floors => {
      // Get unique levels
      this.availableFloors = [...new Set(
        floors.map(f => f.level)
      )].sort((a, b) => a - b);
      
      // If selected floor is no longer available, pick first available
      if (!this.availableFloors.includes(this.selectedFloor) && this.availableFloors.length > 0) {
        this.selectedFloor = this.availableFloors[0];
      }
      this.applyFilters();
    });
  }

  applyFilters(): void {
    this.filteredRooms = this.allRooms.filter(
      (r) => r.floor === this.selectedFloor
    );
  }

  selectFloor(floor: number): void {
    this.selectedFloor = floor;
    this.selectedRoom = null;
    this.isEditing = false;
    this.applyFilters();
  }

  selectRoom(room: Room): void {
    this.selectedRoom = room;
    this.isEditing = false;
  }

  onMapClick(event: MouseEvent): void {
    this.selectedRoom = null;
    this.isEditing = false;
  }

  toggleLayer(layer: 'researchers' | 'equipment' | 'sockets'): void {
    if (layer === 'researchers') this.showResearchers = !this.showResearchers;
    if (layer === 'equipment') this.showEquipment = !this.showEquipment;
    if (layer === 'sockets') this.showSockets = !this.showSockets;
  }

  startEditing(): void {
    if (this.selectedRoom) {
      this.isEditing = true;
      this.editRoomData = { ...this.selectedRoom };
    }
  }

  cancelEditing(): void {
    this.isEditing = false;
  }

  saveRoom(): void {
    if (this.selectedRoom) {
      // In a real app, we would call a service to update the DB
      // Here we update the local model
      Object.assign(this.selectedRoom, this.editRoomData);
      this.isEditing = false;
      this.applyFilters();
    }
  }
}
