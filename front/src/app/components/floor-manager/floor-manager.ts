import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FloorService, Floor } from '../../services/floor.service';
import { RoomService } from '../../services/room.service';

@Component({
  selector: 'app-floor-manager',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="manager-container">
      <header class="manager-header">
        <h1>Importation d'Étages</h1>
        <p>Déposez un fichier JSON pour importer un nouvel étage et ses salles</p>
      </header>

      <div 
        class="upload-zone card" 
        [class.dragging]="isDragging"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave()"
        (drop)="onDrop($event)"
      >
        <div class="upload-content">
          <span class="upload-icon">📁</span>
          <h3>Glissez-déposez votre fichier ici</h3>
          <p>ou</p>
          <input type="file" #fileInput (change)="onFileSelected($event)" accept=".json" hidden>
          <button class="btn-primary" (click)="fileInput.click()">Parcourir les fichiers</button>
        </div>
      </div>

      <div class="format-help card">
        <h4>Format attendu (.json)</h4>
        <pre>{{ jsonExample }}</pre>
      </div>

      <div class="floor-list-section">
        <div class="section-title">Étages importés</div>
        <div class="floor-grid">
          <div *ngFor="let floor of floors" class="floor-card card">
            <div class="floor-info">
              <span class="building-badge">Bâtiment {{ floor.building }}</span>
              <span class="level-text">{{ floor.level === 0 ? 'RDC' : 'Étage ' + floor.level }}</span>
            </div>
            <button class="btn-delete" (click)="deleteFloor(floor.id)">
              Supprimer l'étage
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .manager-container { padding: 40px; max-width: 900px; margin: 0 auto; display: flex; flex-direction: column; gap: 32px; }
    .manager-header h1 { font-size: 32px; font-weight: 800; margin-bottom: 8px; }
    .manager-header p { color: #64748b; }
    .card { background: white; border-radius: 16px; padding: 24px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    
    .upload-zone {
      border: 2px dashed #cbd5e1;
      background: #f8fafc;
      text-align: center;
      padding: 48px;
      transition: all 0.3s ease;
      cursor: pointer;
    }
    .upload-zone.dragging { border-color: #3b82f6; background: #eff6ff; transform: scale(1.01); }
    .upload-icon { font-size: 48px; margin-bottom: 16px; display: block; }
    .upload-content p { color: #94a3b8; margin: 12px 0; }
    
    .format-help { background: #1e293b; color: #e2e8f0; }
    .format-help h4 { color: #3b82f6; margin-bottom: 12px; }
    pre { font-size: 12px; font-family: 'Courier New', Courier, monospace; overflow-x: auto; }
    
    .floor-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px; margin-top: 16px; }
    .floor-card { display: flex; flex-direction: column; gap: 16px; }
    .building-badge { font-size: 11px; font-weight: 700; color: #64748b; background: #f1f5f9; padding: 4px 10px; border-radius: 20px; }
    .level-text { display: block; font-size: 18px; font-weight: 700; margin-top: 8px; }
    .btn-delete { background: #fee2e2; color: #ef4444; border: none; padding: 8px; border-radius: 8px; font-weight: 600; cursor: pointer; }
    .btn-primary { background: #0f172a; color: white; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 600; cursor: pointer; }
    .section-title { font-size: 14px; font-weight: 700; color: #94a3b8; text-transform: uppercase; }
  `]
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
