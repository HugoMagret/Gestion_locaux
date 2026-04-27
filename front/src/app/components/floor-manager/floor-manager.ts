import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FloorService, Floor } from '../../services/floor.service';
import { RoomService } from '../../services/room.service';

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
    private roomService: RoomService
  ) {}

  ngOnInit(): void {
    this.floorService.getFloors().subscribe(data => {
      this.floors = data.sort((a, b) => a.level - b.level);
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
        alert("Erreur lors de la lecture du fichier JSON.");
      }
    };
    reader.readAsText(file);
  }

  private importFloor(data: any): void {
    if (data.level === undefined) {
      alert("Format invalide : 'level' est requis.");
      return;
    }

    // Add floor locally
    this.floorService.addFloor(data.level);

    // Add rooms if present
    if (data.rooms && Array.isArray(data.rooms)) {
      data.rooms.forEach((r: any) => {
        this.roomService.addRoom({
          ...r,
          floor: data.level,
          doors: r.doors || 1,
          color: r.color || '#3498db'
        });
      });
    }

    alert(`Étage ${data.level} importé avec succès !`);
  }

  deleteFloor(id: string): void {
    if (confirm("Supprimer cet étage supprimera toutes ses salles. Continuer ?")) {
      this.floorService.deleteFloor(id);
    }
  }
}
