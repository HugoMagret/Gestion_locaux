import { Component, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Room } from '../../models/room.model';
import { RoomService } from '../../services/room.service';
import { FloorService, Floor } from '../../services/floor.service';
import { DoorService, Door } from '../../services/door.service';

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
  allDoors: Door[] = [];
  filteredDoors: Door[] = [];
  selectedRoom: Room | null = null;

  selectedFloor = 0;
  expandedFloor: number | null = null;
  currentZoom = 1;
  isPanning = false;
  panStartX = 0;
  panStartY = 0;
  panOffsetX = 0;
  panOffsetY = 0;
  private readonly minZoom = 0.5;
  private readonly maxZoom = 3;

  showResearchers = true;
  showEquipment = true;
  showSockets = true;
  availableFloors: number[] = [];

  constructor(
    private roomService: RoomService,
    private floorService: FloorService,
    private doorService: DoorService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.selectedFloor = this.floorService.currentSelectedFloor;
    this.expandedFloor = this.selectedFloor;
    this.loadRooms();
    this.loadFloors();
    this.loadDoors();
  }

  loadDoors(): void {
    this.doorService.getDoors().subscribe({
      next: (data: Door[]) => {
        this.allDoors = data;
        this.applyFilters();
        this.cdr.detectChanges();
      }
    });
    // Trigger initial fetch
    this.doorService.fetchDoorsByFloor(this.selectedFloor);
  }

  loadRooms(): void {
    this.roomService.getRooms().subscribe({
      next: (data: Room[]) => {
        this.allRooms = data;
        this.applyFilters();
        this.cdr.detectChanges(); // Forcer la mise à jour UI
      },
    });
  }

  loadFloors(): void {
    this.floorService.getFloors().subscribe((floors: Floor[]) => {
      this.availableFloors = [...new Set(floors.map((f: Floor) => f.level))].sort((a: number, b: number) => a - b);
      
      if (!this.availableFloors.includes(this.selectedFloor) && this.availableFloors.length > 0) {
        this.selectedFloor = this.availableFloors[0];
      }
      
      // Dérouler le premier étage dispo par défaut
      if (this.availableFloors.length > 0 && (this.expandedFloor === null || !this.availableFloors.includes(this.expandedFloor))) {
        this.expandedFloor = this.selectedFloor;
      }

      this.applyFilters();
      this.cdr.detectChanges(); // Forcer la mise à jour UI
    });
  }

  applyFilters(): void {
    this.filteredRooms = this.allRooms.filter((r) => r.floor === this.selectedFloor);
    this.filteredDoors = this.allDoors.filter((d) => d.floor === this.selectedFloor);
  }

  selectFloor(floor: number): void {
    this.selectedFloor = floor;
    this.floorService.currentSelectedFloor = floor;
    this.selectedRoom = null;
    this.applyFilters();
    this.doorService.fetchDoorsByFloor(floor); // Refresh doors when floor changes
    this.cdr.detectChanges();
  }

  toggleFloorAccordion(floor: number): void {
    // Ferme si on reclique, sinon ouvre
    this.expandedFloor = this.expandedFloor === floor ? null : floor;
    // Sélectionne l'étage sur la carte si on l'ouvre
    if (this.expandedFloor !== null && this.selectedFloor !== floor) {
      this.selectFloor(floor);
    }
    this.cdr.detectChanges();
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
    this.cdr.detectChanges();
  }

  onMapClick(event: MouseEvent): void {
    this.selectedRoom = null;
    this.cdr.detectChanges();
  }

  toggleLayer(layer: 'researchers' | 'equipment' | 'sockets'): void {
    if (layer === 'researchers') this.showResearchers = !this.showResearchers;
    if (layer === 'equipment') this.showEquipment = !this.showEquipment;
    if (layer === 'sockets') this.showSockets = !this.showSockets;
  }

  onWheel(event: WheelEvent): void {
    event.preventDefault();
    const zoomIntensity = 0.1;

    if (event.deltaY < 0) {
      this.currentZoom = Math.min(this.currentZoom + zoomIntensity, this.maxZoom);
    } else {
      this.currentZoom = Math.max(this.currentZoom - zoomIntensity, this.minZoom);
    }
  }

  onMouseDown(event: MouseEvent): void {
    if (event.button === 2) {
      event.preventDefault();
      this.isPanning = true;
      this.panStartX = event.clientX - this.panOffsetX;
      this.panStartY = event.clientY - this.panOffsetY;
    }
  }

  onMouseMove(event: MouseEvent): void {
    if (!this.isPanning) return;
    this.panOffsetX = event.clientX - this.panStartX;
    this.panOffsetY = event.clientY - this.panStartY;
  }

  onMouseUp(event: MouseEvent): void {
    if (event.button === 2) {
      this.isPanning = false;
    }
  }

  onContextMenu(event: MouseEvent): void {
    event.preventDefault();
  }

  zoomIn(): void {
    this.currentZoom = Math.min(this.maxZoom, this.currentZoom + 0.15);
  }

  zoomOut(): void {
    this.currentZoom = Math.max(this.minZoom, this.currentZoom - 0.15);
  }

  goToDetail(): void {
    if (this.selectedRoom) {
      this.roomSelected.emit(this.selectedRoom.id);
    }
  }
}

