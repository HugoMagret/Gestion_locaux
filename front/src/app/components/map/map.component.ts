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
  rooms: Room[] = [];
  selectedRoom: Room | null = null;

  // Filters / Layers state
  showSockets = false;
  showEquipment = false;
  showStaff = false;

  constructor(private roomService: RoomService) {}

  ngOnInit(): void {
    this.loadRooms();
  }

  loadRooms(): void {
    this.roomService.getRooms().subscribe({
      next: (data) => {
        this.rooms = data;
      },
      error: (error) => {
        console.error('Error loading rooms:', error);
      },
    });
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
    console.log('Adding reservation for room:', room.name);
  }
}
