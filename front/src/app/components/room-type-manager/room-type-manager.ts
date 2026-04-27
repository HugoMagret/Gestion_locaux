import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReferenceService } from '../../services/reference.service';
import { RoomType } from '../../models/room-type.model';

@Component({
  selector: 'app-room-type-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './room-type-manager.html',
  styleUrls: ['./room-type-manager.css']
})
export class RoomTypeManagerComponent implements OnInit {
  roomTypes: RoomType[] = [];
  newTypeLabel: string = '';

  constructor(private referenceService: ReferenceService) {}

  ngOnInit(): void {
    this.loadTypes();
  }

  loadTypes(): void {
    this.referenceService.getRoomTypes().subscribe(types => {
      this.roomTypes = types;
    });
  }

  addType(): void {
    if (!this.newTypeLabel.trim()) return;

    this.referenceService.addRoomType(this.newTypeLabel).subscribe(() => {
      this.newTypeLabel = '';
      this.loadTypes();
    });
  }

  deleteType(id: string): void {
    if (confirm('Supprimer ce type de salle ? Cela peut affecter les salles existantes.')) {
      this.referenceService.deleteRoomType(id).subscribe(() => {
        this.loadTypes();
      });
    }
  }
}
