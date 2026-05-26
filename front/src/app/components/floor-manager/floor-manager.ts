import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, take } from 'rxjs';
import { FloorService, Floor } from '../../services/floor.service';
import { RoomService } from '../../services/room.service';
import { DoorService, Door } from '../../services/door.service';
import { Room } from '../../models/room.model';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-floor-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './floor-manager.html',
  styleUrls: ['./floor-manager.css']
})
export class FloorManagerComponent implements OnInit {
  floors: Floor[] = [];
  isDragging = false;
  addMode: 'file' | 'text' | 'form' = 'file';
  jsonExample = `{
  "level": 1,
  "rooms": [
    { "name": "G103", "coordinates": { "x": 2, "y": 2, "width": 177, "height": 231 }, "max_capacity": 30, "doors": 1, "floor": 1, "color": "#3498db" }
  ],
  "doors": [
    { "floor": 1, "coordinates": { "x": 179, "y": 100, "width": 6, "height": 50 } }
  ]
}`;
  isEditorOpen = false;
  editingJsonText = '';
  jsonError: string | null = null;
  previewData: any = null;
  editingFloorLevel: number = 0;
  manualJsonText = `{
  "level": 99,
  "rooms": [
    {
      "name": "Salle de Test",
      "coordinates": { "x": 0, "y": 0, "width": 150, "height": 100 },
      "max_capacity": 30,
      "doors": 1,
      "color": "#3498db"
    }
  ]
}`;
  formFloorLevel: number = 1;
  formRoom: any = { name: '', max_capacity: 30, doors: 1, coordinates: { x: 0, y: 0, width: 150, height: 100 }, color: '#3498db' };
  formRooms: any[] = [];
  showInfoModal = false;

  constructor(
    private floorService: FloorService,
    private roomService: RoomService,
    private doorService: DoorService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.floorService.getFloors().subscribe((data: Floor[]) => {
      this.floors = data.sort((a: Floor, b: Floor) => a.level - b.level);
      this.cdr.detectChanges();
    });
  }

  openEditor(floor: Floor): void {
    this.editingFloorLevel = floor.level;

    forkJoin({
      rooms: this.roomService.getRooms().pipe(take(1)),
      doors: this.doorService.getDoorsByFloor(floor.level).pipe(take(1))
    }).subscribe(({ rooms, doors }: { rooms: Room[]; doors: Door[] }) => {
      const floorRooms = rooms
        .filter((room: Room) => room.floor === floor.level)
        .map((room: Room) => ({
          id: room.id,
          name: room.name,
          max_capacity: room.max_capacity,
          room_type_id: room.room_type_id,
          doors: room.doors,
          floor: room.floor,
          color: room.color,
          coordinates: room.coordinates
        }));

      const floorDoors = doors.map((door: Door) => ({
        id: door.id,
        floor: door.floor,
        coordinates: door.coordinates
      }));

      const data = { level: floor.level, rooms: floorRooms, doors: floorDoors };
      this.editingJsonText = JSON.stringify(data, null, 2);
      this.previewData = data;
      this.jsonError = null;
      this.isEditorOpen = true;
      this.cdr.detectChanges();
    });
  }

  onJsonInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    const text = target.value;
    this.editingJsonText = text;

    try {
      this.previewData = JSON.parse(text);
      this.jsonError = null;
    } catch (e: any) {
      this.previewData = null;
      this.jsonError = e.message;
    }
  }

  saveJson(event?: Event): void {
    if (event) event.preventDefault();
    if (this.jsonError || !this.previewData) return;

    if (this.previewData && this.previewData.level !== this.editingFloorLevel) {
      this.jsonError = "Erreur : Vous n'avez pas le droit de modifier le niveau (level) de l'étage.";
      this.cdr.detectChanges();
      return;
    }

    this.floorService.updateFloorJson(this.editingFloorLevel, this.previewData).subscribe({
      next: () => {
        this.notificationService.showSuccess('Étage mis à jour avec succès.');
        this.isEditorOpen = false;
        this.roomService.refreshRooms();
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.jsonError = 'Erreur serveur : ' + (err.error?.error || err.message);
        this.cdr.detectChanges();
      }
    });
  }

  addRoomToForm(): void {
    if (!this.formRoom.name) return;
    this.formRooms.push({ ...this.formRoom });
    this.formRoom.name = '';
  }

  submitFormFloor(): void {
    const data = { level: this.formFloorLevel, rooms: this.formRooms, doors: [] };
    this.importFloor(data);
    this.formRooms = [];
  }

  importManualJson(): void {
    try {
      const data = JSON.parse(this.manualJsonText);
      this.importFloor(data);
    } catch (e: any) {
      alert('Le format JSON est invalide.');
    }
  }

  downloadJson(floor: Floor): void {
    this.roomService.getRooms().pipe(take(1)).subscribe((rooms: Room[]) => {
      this.doorService.getDoorsByFloor(floor.level).pipe(take(1)).subscribe((doors: Door[]) => {
        const floorRooms = rooms
          .filter((room: Room) => room.floor === floor.level)
          .map((room: Room) => ({
            id: room.id,
            name: room.name,
            max_capacity: room.max_capacity,
            room_type_id: room.room_type_id,
            doors: room.doors,
            floor: room.floor,
            color: room.color,
            coordinates: room.coordinates
          }));

        const floorDoors = doors.map((door: Door) => ({
          id: door.id,
          floor: door.floor,
          coordinates: door.coordinates
        }));

        const data = JSON.stringify({ level: floor.level, rooms: floorRooms, doors: floorDoors }, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `etage_${floor.level}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
      });
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

    const existingFloor = this.floors.find((f: Floor) => f.level === data.level);
    if (existingFloor) {
      if (!confirm(`L'étage ${data.level} existe déjà. Voulez-vous l'écraser ?`)) return;
      this.floorService.deleteFloor(existingFloor.id);

      setTimeout(() => {
        this.floorService.importFloor(data).subscribe({
          next: () => {
            this.notificationService.showSuccess(`Étage ${data.level} traité.`);
            this.roomService.refreshRooms();
          },
          error: (err: any) => {
            this.notificationService.showError(err.error?.error || "Une erreur est survenue lors de l'importation.");
          }
        });
      }, 500);
      return;
    }

    this.floorService.importFloor(data).subscribe({
      next: () => {
        this.notificationService.showSuccess(`Étage ${data.level} traité.`);
        this.roomService.refreshRooms();
      },
      error: (err: any) => {
        this.notificationService.showError(err.error?.error || "Une erreur est survenue lors de l'importation.");
      }
    });
  }

  isModalOpen = false;
  floorToDeleteId: string | null = null;

  openDeleteModal(id: string): void {
    this.floorToDeleteId = id;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.floorToDeleteId = null;
  }

  confirmDelete(): void {
    if (this.floorToDeleteId) {
      this.floorService.deleteFloor(this.floorToDeleteId);
      this.notificationService.showSuccess("L'étage a été supprimé avec succès.");
      this.closeModal();
    }
  }
}
