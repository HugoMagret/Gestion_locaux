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

  // Navigation state
  selectedFloor = 0;
  expandedFloor: number | null = null;
  currentZoom = 1;
  private readonly minZoom = 0.5;
  private readonly maxZoom = 2;

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
    // Initialize expandedFloor to show first floor by default
    this.floorService.getFloors().subscribe(floors => {
      const floorLevels = [...new Set(floors.map(f => f.level))].sort((a, b) => a - b);
      if (floorLevels.length > 0) {
        this.expandedFloor = floorLevels[0];
      }
    });
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
    this.applyFilters();
  }

  toggleFloorAccordion(floor: number): void {
    this.expandedFloor = this.expandedFloor === floor ? null : floor;
    if (this.selectedFloor !== floor) {
      this.selectFloor(floor);
    }
  }

  getRoomsForFloor(floor: number): Room[] {
    return this.allRooms.filter(r => r.floor === floor);
  }

  selectRoom(room: Room): void {
    if (this.selectedFloor !== room.floor) {
      this.selectedFloor = room.floor;
      this.applyFilters();
    }
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

  zoomIn(): void {
    this.currentZoom = Math.min(this.maxZoom, this.currentZoom + 0.1);
  }

  zoomOut(): void {
    this.currentZoom = Math.max(this.minZoom, this.currentZoom - 0.1);
  }

  goToDetail(): void {
    if (this.selectedRoom) {
      this.roomSelected.emit(this.selectedRoom.id);
    }
  }
}
