import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
  newTypeColor: string = '#3498db';

  constructor(
    private referenceService: ReferenceService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadTypes();
  }

  loadTypes(): void {
    this.referenceService.getRoomTypes().subscribe({
      next: (types) => {
        this.roomTypes = types;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erreur lors du chargement des types de salles:', err)
    });
  }

  addType(): void {
    if (!this.newTypeLabel.trim()) return;

    this.referenceService.addRoomType(this.newTypeLabel, this.newTypeColor).subscribe({
      next: () => {
        this.newTypeLabel = '';
        this.newTypeColor = '#3498db';
        this.loadTypes();
      },
      error: (err) => console.error('Erreur lors de l\'ajout du type:', err)
    });
  }

  deleteType(id: string): void {
    if (confirm('Supprimer ce type de salle ? Cela peut affecter les salles existantes.')) {
      this.referenceService.deleteRoomType(id).subscribe({
        next: () => this.loadTypes(),
        error: (err) => console.error('Erreur lors de la suppression:', err)
      });
    }
  }
}
