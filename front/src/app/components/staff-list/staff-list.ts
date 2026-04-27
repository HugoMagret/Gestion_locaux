import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StaffService } from '../../services/staff.service';
import { RoomService } from '../../services/room.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-staff-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './staff-list.html',
  styleUrls: ['./staff-list.css']
})
export class StaffListComponent implements OnInit {
  staffWithRooms: any[] = [];

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
      this.staffWithRooms = staff.map(s => ({
        ...s,
        room: rooms.find(r => r.id === s.room_id)
      }));
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
