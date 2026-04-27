import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Room } from '../../models/room.model';
import { RoomService } from '../../services/room.service';
import { FloorService } from '../../services/floor.service';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map.html',
  styleUrls: ['./map.css'],
})
export class MapComponent implements OnInit {
  allRooms: Room[] = [];
  filteredRooms: Room[] = [];
  selectedRoom: Room | null = null;

  // Navigation state
  selectedFloor = 0;

  // Filters / Layers state
  showResearchers = false;
  showEquipment = false;
  showSockets = false;

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
    this.applyFilters();
  }

  selectRoom(room: Room): void {
    this.selectedRoom = room;
  }

  onMapClick(event: MouseEvent): void {
    this.selectedRoom = null;
  }

  toggleLayer(layer: 'researchers' | 'equipment' | 'sockets'): void {
    if (layer === 'researchers') this.showResearchers = !this.showResearchers;
    if (layer === 'equipment') this.showEquipment = !this.showEquipment;
    if (layer === 'sockets') this.showSockets = !this.showSockets;
  }

  addReservation(room: Room): void {
    console.log('Managing room:', room.name);
  }
}
