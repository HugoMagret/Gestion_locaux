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
  "building": "A",
  "level": 2,
  "rooms": [
    { "name": "Salle 201", "max_capacity": 20, "start_x": 100, "start_y": 100, "x": 150, "y": 120 },
    { "name": "Bureau 202", "max_capacity": 4, "start_x": 300, "start_y": 100, "x": 100, "y": 100 }
  ]
}`;

  constructor(
    private floorService: FloorService,
    private roomService: RoomService
  ) {}

  ngOnInit(): void {
    this.floorService.getFloors().subscribe(data => {
      this.floors = data.sort((a, b) => a.building.localeCompare(b.building) || a.level - b.level);
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
    if (!data.building || data.level === undefined) {
      alert("Format invalide : 'building' et 'level' sont requis.");
      return;
    }

    // Add floor
    this.floorService.addFloor({
      building: data.building,
      level: data.level
    });

    // Add rooms if present
    if (data.rooms && Array.isArray(data.rooms)) {
      data.rooms.forEach((r: any) => {
        this.roomService.addRoom({
          ...r,
          building: data.building,
          floor: data.level,
          id: Math.random().toString(36).substr(2, 9),
          staff: [],
          equipments: [],
          sockets: [],
          doors: 1
        });
      });
    }

    alert(`Étage ${data.level} du bâtiment ${data.building} importé avec succès !`);
  }

  deleteFloor(id: string): void {
    this.floorService.deleteFloor(id);
  }
}
