import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StaffService } from '../../services/staff.service';
import { RoomService } from '../../services/room.service';
import { Room } from '../../models/room.model';
import { Staff } from '../../models/staff.model';
import { Observable, combineLatest, map, BehaviorSubject, switchMap } from 'rxjs';

@Component({
  selector: 'app-staff-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './staff-list.html',
  styleUrls: ['./staff-list.css']
})
export class StaffListComponent implements OnInit {
  private refreshStaff$ = new BehaviorSubject<void>(undefined);
  staffWithRooms$!: Observable<any[]>;
  rooms$!: Observable<Room[]>;
  
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
    this.roomService.refreshRooms();
    this.rooms$ = this.roomService.getRooms();
    
    this.staffWithRooms$ = this.refreshStaff$.pipe(
      switchMap(() => combineLatest({
        staff: this.staffService.getStaff(),
        rooms: this.rooms$
      })),
      map(({ staff, rooms }) => staff.map(s => ({
        ...s,
        room: rooms.find(r => r.id === s.room_id)
      })))
    );
  }

  loadData(): void {
    this.roomService.refreshRooms();
    this.refreshStaff$.next();
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
