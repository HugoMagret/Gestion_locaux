import { Component, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Room } from '../../models/room.model';
import { RoomService } from '../../services/room.service';
import { FloorService } from '../../services/floor.service';
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
  svgViewBox = '0 0 1800 800';
  private readonly baseViewBox = { x: 0, y: 0, width: 1800, height: 800 };
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
    this.updateSvgViewBox();
    this.loadRooms();
    this.loadFloors();
    this.loadDoors();
  }

  loadDoors(): void {
    this.doorService.getDoors().subscribe({
      next: (data) => {
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
      next: (data) => {
        this.allRooms = data;
        this.applyFilters();
        this.cdr.detectChanges(); // Forcer la mise à jour UI
      },
    });
  }

  loadFloors(): void {
    this.floorService.getFloors().subscribe(floors => {
      this.availableFloors = [...new Set(floors.map(f => f.level))].sort((a, b) => a - b);
      
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

  zoomIn(): void {
    this.currentZoom = Math.min(this.maxZoom, this.currentZoom + 0.15);
    this.updateSvgViewBox();
  }

  zoomOut(): void {
    this.currentZoom = Math.max(this.minZoom, this.currentZoom - 0.15);
    this.updateSvgViewBox();
  }

  private updateSvgViewBox(): void {
    const zoom = this.currentZoom || 1;
    const width = this.baseViewBox.width / zoom;
    const height = this.baseViewBox.height / zoom;
    const x = this.baseViewBox.x + (this.baseViewBox.width - width) / 2;
    const y = this.baseViewBox.y + (this.baseViewBox.height - height) / 2;
    this.svgViewBox = `${x} ${y} ${width} ${height}`;
  }

  goToDetail(): void {
    if (this.selectedRoom) {
      this.roomSelected.emit(this.selectedRoom.id);
    }
  }
}

