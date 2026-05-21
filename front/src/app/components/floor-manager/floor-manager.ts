import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FloorService, Floor } from '../../services/floor.service';
import { RoomService } from '../../services/room.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-floor-manager',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './floor-manager.html',
  styleUrls: ['./floor-manager.css']
})
export class FloorManagerComponent implements OnInit {
  floors: Floor[] = [];
  isDragging = false;
  jsonExample = `{
  "level": 2,
  "rooms": [
    { "name": "Salle 201", "max_capacity": 20, "coordinates": { "x": 100, "y": 100, "width": 150, "height": 120 } },
    { "name": "Bureau 202", "max_capacity": 4, "coordinates": { "x": 300, "y": 100, "width": 100, "height": 100 } }
  ]
}`;

  constructor(
    private floorService: FloorService,
    private roomService: RoomService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.floorService.getFloors().subscribe(data => {
      this.floors = data.sort((a, b) => a.level - b.level);
      this.cdr.detectChanges();
    });
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(): void {
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.handleFile(file);
    }
  }

  private handleFile(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const data = JSON.parse(e.target.result);
        this.importFloor(data);
      } catch (err) {
        this.notificationService.showError("Erreur lors de la lecture du fichier JSON.");
      }
    };
    reader.readAsText(file);
  }

  private importFloor(data: any): void {
    if (data.level === undefined) {
      this.notificationService.showError("Format invalide : 'level' est requis.");
      return;
    }

    this.floorService.importFloor(data).subscribe({
      next: (res) => {
        this.notificationService.showSuccess(res.message || `Étage ${data.level} importé avec succès !`);
        this.roomService.refreshRooms();
      },
      error: (err) => {
        this.notificationService.showError(err.error?.error || "Une erreur est survenue lors de l'importation.");
      }
    });
  }

  deleteFloor(id: string): void {
    if (confirm("Supprimer cet étage supprimera toutes ses salles. Continuer ?")) {
      this.floorService.deleteFloor(id);
    }
  }
}
