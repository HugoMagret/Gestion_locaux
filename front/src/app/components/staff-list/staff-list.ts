import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StaffService } from '../../services/staff.service';
import { RoomService } from '../../services/room.service';
import { Room } from '../../models/room.model';
import { Staff } from '../../models/staff.model';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-staff-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './staff-list.html',
  styleUrls: ['./staff-list.css']
})
export class StaffListComponent implements OnInit {
  staffWithRooms: any[] = [];
  rooms: Room[] = [];
  newStaff = {
    first_name: '',
    last_name: '',
    room_id: ''
  };

  constructor(
    private staffService: StaffService,
    private roomService: RoomService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    forkJoin({
      staff: this.staffService.getStaff(),
      rooms: this.roomService.getRooms()
    }).subscribe(({ staff, rooms }) => {
      this.rooms = rooms;
      this.staffWithRooms = staff.map(s => ({
        ...s,
        room: rooms.find(r => r.id === s.room_id)
      }));
    });
  }

  addStaff(): void {
    if (!this.newStaff.first_name || !this.newStaff.last_name) return;

    this.staffService.addStaff(new Staff(this.newStaff)).subscribe(() => {
      this.newStaff = { first_name: '', last_name: '', room_id: '' };
      this.loadData();
    });
  }

  deleteStaff(id: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce membre du personnel ?')) {
      this.staffService.deleteStaff(id).subscribe(() => {
        this.loadData();
      });
    }
  }
}
