import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoomService } from '../../services/room.service';
import { ReferenceService } from '../../services/reference.service';
import { Room } from '../../models/room.model';
import { RoomType } from '../../models/room-type.model';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-room-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './room-list.html',
  styleUrls: ['./room-list.css']
})
export class RoomListComponent implements OnInit {
  @Output() roomSelected = new EventEmitter<string>();
  allRooms: Room[] = [];
  filteredRooms: Room[] = [];
  roomTypes: RoomType[] = [];
  
  // Filter options
  buildings: string[] = [];
  floors: number[] = [];
  
  // Current filters
  filters = {
    name: '',
    floor: '' as number | string,
    type: ''
  };

  constructor(
    private roomService: RoomService,
    private referenceService: ReferenceService
  ) {}

  ngOnInit(): void {
    // Load static types once
    this.referenceService.getRoomTypes().subscribe(types => {
      this.roomTypes = types;
    });

    // Subscribe to rooms for real-time updates
    this.roomService.getRooms().subscribe(rooms => {
      this.allRooms = rooms;
      this.floors = [...new Set(rooms.map(r => r.floor))].sort((a, b) => a - b);
      this.applyFilters();
    });
  }

  applyFilters(): void {
    this.filteredRooms = this.allRooms.filter(room => {
      const matchName = !this.filters.name || room.name.toLowerCase().includes(this.filters.name.toLowerCase());
      const matchFloor = this.filters.floor === '' || room.floor === Number(this.filters.floor);
      const matchType = !this.filters.type || room.room_type_id === this.filters.type;
      
      return matchName && matchFloor && matchType;
    });
  }

  hasActiveFilters(): boolean {
    return !!(this.filters.name || this.filters.floor !== '' || this.filters.type);
  }

  resetFilters(): void {
    this.filters = {
      name: '',
      floor: '',
      type: ''
    };
    this.applyFilters();
  }

  deleteRoom(id: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette salle ?')) {
      this.roomService.deleteRoom(id);
      // RoomService updates the BehaviorSubject, so we need to refresh or listen
      // For simplicity, RoomService should update its internal state which we subscribe to
    }
  }

  selectRoom(id: string): void {
    this.roomSelected.emit(id);
  }
}
