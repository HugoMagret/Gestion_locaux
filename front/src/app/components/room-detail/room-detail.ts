import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Room } from '../../models/room.model';
import { RoomType } from '../../models/room-type.model';
import { RoomService } from '../../services/room.service';
import { ReferenceService } from '../../services/reference.service';
import { FloorService } from '../../services/floor.service';

@Component({
  selector: 'app-room-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './room-detail.html',
  styleUrls: ['./room-detail.css']
})
export class RoomDetailComponent implements OnInit {
  @Input() roomId!: string;
  @Output() back = new EventEmitter<void>();

  private roomService = inject(RoomService);
  private referenceService = inject(ReferenceService);
  private floorService = inject(FloorService);

  room: Room | null = null;
  roomTypes: RoomType[] = [];
  availableFloors: number[] = [];
  
  editData: any = {};
  isSaving = false;

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    // Load reference data
    this.referenceService.getRoomTypes().subscribe(types => this.roomTypes = types);
    this.floorService.getFloors().subscribe(floors => {
      this.availableFloors = [...new Set(floors.map(f => f.level))].sort((a, b) => a - b);
    });

    // Load room
    this.roomService.getRooms().subscribe(rooms => {
      const found = rooms.find(r => r.id === this.roomId);
      if (found) {
        this.room = found;
        this.editData = { ...found };
      }
    });
  }

  save(): void {
    this.isSaving = true;
    // In a real app, call service.updateRoom()
    // For now, simulate local update
    if (this.room) {
      Object.assign(this.room, this.editData);
      setTimeout(() => {
        this.isSaving = false;
        this.goBack();
      }, 500);
    }
  }

  goBack(): void {
    this.back.emit();
  }
}
