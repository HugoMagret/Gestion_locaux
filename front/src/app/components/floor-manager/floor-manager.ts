import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, take } from 'rxjs';
import { FloorService, Floor } from '../../services/floor.service';
import { RoomService } from '../../services/room.service';
import { DoorService, Door } from '../../services/door.service';
import { Room } from '../../models/room.model';
import { NotificationService } from '../../services/notification.service';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../api.config';
import { jsPDF } from 'jspdf';

@Component({
  selector: 'app-floor-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './floor-manager.html',
  styleUrls: ['./floor-manager.css']
})
export class FloorManagerComponent implements OnInit {
  floors: Floor[] = [];
  allRooms: any[] = [];
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
  isCreating = false;
  isFormBuilderOpen = false;
  editingJsonText = '';
  manualPreviewData: any = null;
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
  editingFormRoomIndex: number = -1;
  showInfoModal = false;
  draggedRoom: any = null;
  dragOffsetX = 0;
  dragOffsetY = 0;

  constructor(
    private floorService: FloorService,
    private roomService: RoomService,
    private doorService: DoorService,
    private notificationService: NotificationService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    try {
      this.manualPreviewData = JSON.parse(this.manualJsonText);
    } catch (e) {
      this.manualPreviewData = null;
    }

    this.floorService.getFloors().subscribe((data: Floor[]) => {
      this.floors = data.sort((a: Floor, b: Floor) => a.level - b.level);
      this.cdr.detectChanges();
    });

    this.roomService.getRooms().subscribe((rooms: Room[]) => {
      this.allRooms = rooms;
    });
  }

  openCreateJsonEditor(): void {
    this.isFormBuilderOpen = false;
    this.isCreating = true;
    this.editingJsonText = this.manualJsonText || this.jsonExample;
    try {
      this.previewData = JSON.parse(this.editingJsonText);
      this.jsonError = null;
      this.editingFloorLevel = this.previewData.level ?? 99;
    } catch (e: any) {
      this.previewData = null;
      this.jsonError = e.message;
      this.editingFloorLevel = 99;
    }
    this.isEditorOpen = true;
    this.cdr.detectChanges();
  }

  openFormBuilder(): void {
    this.isCreating = false;
    this.isEditorOpen = false;
    this.isFormBuilderOpen = true;
    this.cdr.detectChanges();
  }

  closeFormBuilder(): void {
    this.isFormBuilderOpen = false;
    this.cdr.detectChanges();
  }

  openEditor(floor: Floor): void {
    this.isCreating = false;
    this.isFormBuilderOpen = false;
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

  onManualJsonInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    const text = target.value;
    this.manualJsonText = text;

    try {
      this.manualPreviewData = JSON.parse(text);
    } catch (e: any) {
      this.manualPreviewData = null;
    }
  }

  startDrag(event: MouseEvent, room: any): void {
    this.draggedRoom = room;
    this.dragOffsetX = event.offsetX - room.coordinates.x;
    this.dragOffsetY = event.offsetY - room.coordinates.y;
  }

  onDrag(event: MouseEvent): void {
    if (!this.draggedRoom) return;

    this.draggedRoom.coordinates.x = Math.max(0, event.offsetX - this.dragOffsetX);
    this.draggedRoom.coordinates.y = Math.max(0, event.offsetY - this.dragOffsetY);

    if (this.isEditorOpen) {
      this.editingJsonText = JSON.stringify(this.previewData, null, 2);
    }
  }

  stopDrag(): void {
    this.draggedRoom = null;
  }

  saveJson(event?: Event): void {
    if (event) event.preventDefault();
    if (this.jsonError || !this.previewData) return;

    if (this.isCreating) {
      this.importFloor(this.previewData);
      this.isEditorOpen = false;
      this.isCreating = false;
      return;
    }

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
    if (this.editingFormRoomIndex > -1) {
      this.formRooms[this.editingFormRoomIndex] = { ...this.formRoom };
      this.editingFormRoomIndex = -1;
    } else {
      this.formRooms.push({ ...this.formRoom });
    }
    this.formRoom.name = '';
    this.formRoom.coordinates = { x: 0, y: 0, width: 150, height: 100 };
    this.formRoom.max_capacity = 30;
    this.formRoom.doors = 1;
    this.formRoom.color = '#3498db';
  }

  editPreparedRoom(index: number): void {
    this.formRoom = { ...this.formRooms[index] };
    this.editingFormRoomIndex = index;
  }

  removePreparedRoom(index: number): void {
    this.formRooms.splice(index, 1);
    if (this.editingFormRoomIndex === index) {
      this.editingFormRoomIndex = -1;
      this.formRoom = { name: '', max_capacity: 30, doors: 1, coordinates: { x: 0, y: 0, width: 150, height: 100 }, color: '#3498db' };
    }
  }

  submitFormFloor(): void {
    const data = { level: this.formFloorLevel, rooms: this.formRooms, doors: [] };
    this.importFloor(data);
    this.formRooms = [];
    this.editingFormRoomIndex = -1;
  }

  buildFormPreview(): any {
    const draftRooms = [...this.formRooms];
    if (this.formRoom.name?.trim()) {
      draftRooms.push({ ...this.formRoom });
    }

    return {
      level: this.formFloorLevel,
      rooms: draftRooms,
      doors: []
    };
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

      // Suppression de l'existant puis importation
      this.floorService.deleteFloor(existingFloor.id);
      setTimeout(() => this.executeImport(data), 500);
    } else {
      this.executeImport(data);
    }
  }

  private executeImport(data: any): void {
    this.floorService.importFloor(data).subscribe({
      next: (res: any) => {
        this.notificationService.showSuccess(`Étage ${data.level} traité avec succès !`);
        this.roomService.refreshRooms();
        this.addMode = 'file';
        this.isEditorOpen = false;
        this.isFormBuilderOpen = false;
        this.isCreating = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.notificationService.showError("Erreur d'importation.");
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

  exportFloorPDF(level: number): void {
    this.notificationService.showSuccess(`Génération du PDF pour l'étage ${level === 0 ? 'RDC' : level}...`);

    this.http.get<any[]>(`${API_URL}/doors?floor=${level}`).subscribe({
      next: (doorsData: any[]) => {
        const doors = doorsData.map((d: any) => ({
          id: d.id,
          floor: d.floor,
          coordinates: typeof d.coordinates === 'string' ? JSON.parse(d.coordinates) : d.coordinates
        }));
        this.generatePDF(level, doors);
      },
      error: (err: any) => {
        console.error("Erreur lors de la récupération des portes:", err);
        this.generatePDF(level, []);
      }
    });
  }

  private generatePDF(level: number, doors: any[]): void {
    const doc = new jsPDF({
      orientation: 'l',
      unit: 'mm',
      format: 'a4'
    });

    const floorName = level === 0 ? 'Rez-de-chaussée (RDC)' : `Étage ${level}`;
    const dateStr = new Date().toLocaleString('fr-FR');

    // PAGE 1: PLAN VISUEL
    // Header
    doc.setFillColor(15, 23, 42); // slate-900 background for a sleek header
    doc.rect(0, 0, 297, 30, 'F');

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text(`PLAN DE L'ÉTAGE : ${floorName.toUpperCase()}`, 20, 18);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(203, 213, 225);
    doc.text(`Gestion des Locaux - Généré le ${dateStr}`, 20, 24);

    // Get rooms for this floor
    const floorRooms = this.allRooms.filter(r => r.floor === level);

    if (floorRooms.length === 0) {
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(100, 116, 139);
      doc.text("Aucune salle définie pour cet étage.", 20, 70);
    } else {
      // Bounding box mapping
      // Since SVG viewBox is 1800 x 800, we fit it into 257mm x 114.2mm
      const scale = 257 / 1800;
      const startX = 20;
      const startY = 45;

      // Draw all rooms
      floorRooms.forEach(room => {
        const coords = room.coordinates;
        if (!coords) return;

        const rx = startX + coords.x * scale;
        const ry = startY + coords.y * scale;
        const rw = coords.width * scale;
        const rh = coords.height * scale;

        // Parse color
        let rColor = 52, gColor = 152, bColor = 219; // Default #3498db
        if (room.color && room.color.startsWith('#')) {
          const hex = room.color;
          rColor = parseInt(hex.slice(1, 3), 16) || 52;
          gColor = parseInt(hex.slice(3, 5), 16) || 152;
          bColor = parseInt(hex.slice(5, 7), 16) || 219;
        }

        // Draw Room Fill
        doc.setFillColor(rColor, gColor, bColor);
        doc.rect(rx, ry, rw, rh, 'F');

        // Draw Room Border (Stroke)
        doc.setDrawColor(71, 85, 105); // slate-600
        doc.setLineWidth(0.3);
        doc.rect(rx, ry, rw, rh, 'D');

        // Draw Room Label in center
        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(255, 255, 255);
        doc.text(room.name, rx + rw / 2, ry + rh / 2, { align: 'center', baseline: 'middle' });
      });

      // Draw all doors
      doors.forEach(door => {
        const coords = door.coordinates;
        if (!coords) return;

        const dx = startX + coords.x * scale;
        const dy = startY + coords.y * scale;
        const dw = coords.width * scale;
        const dh = coords.height * scale;

        // Draw Door Fill (amber)
        doc.setFillColor(217, 119, 6);
        doc.rect(dx, dy, dw, dh, 'F');

        // Draw Door Border (dark amber)
        doc.setDrawColor(180, 83, 9);
        doc.setLineWidth(0.2);
        doc.rect(dx, dy, dw, dh, 'D');
      });

      // Draw Legend at the bottom of Page 1
      const legendY = 175;
      doc.setDrawColor(226, 232, 240);
      doc.line(startX, legendY - 5, 297 - startX, legendY - 5);

      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(71, 85, 105);
      doc.text("Légende :", startX, legendY);

      // Room legend item
      doc.setFillColor(52, 152, 219);
      doc.rect(startX + 20, legendY - 3, 5, 4, 'F');
      doc.setFont("helvetica", "normal");
      doc.text("Salles / Locaux", startX + 27, legendY);

      // Door legend item
      doc.setFillColor(217, 119, 6);
      doc.rect(startX + 65, legendY - 3, 5, 4, 'F');
      doc.text("Portes d'accès", startX + 72, legendY);
    }

    // PAGE 2 AND ONWARDS: DETAILED REPORT
    doc.addPage();

    let yPos = 35;
    const margin = 20;
    const pageHeight = 210;

    const checkPageOverflow = (neededHeight: number) => {
      if (yPos + neededHeight > pageHeight - margin) {
        doc.addPage();
        drawPageHeader();
        yPos = 35;
      }
    };

    const drawPageHeader = () => {
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, 297, 20, 'F');
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text(`ÉTAT DÉTAILLÉ DE L'ÉTAGE : ${floorName.toUpperCase()}`, margin, 13);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(203, 213, 225);
      doc.text(`Généré le ${dateStr}`, 297 - margin - 50, 13);
    };

    drawPageHeader();

    // Print rooms list
    if (floorRooms.length === 0) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text("Aucun local enregistré à cet étage.", margin, yPos);
    } else {
      floorRooms.forEach((room, index) => {
        // Calculate dynamic height needed
        const staffCount = room.staff ? room.staff.length : 0;
        const equipmentCount = room.equipments ? room.equipments.length : 0;
        const socketCount = room.sockets ? room.sockets.length : 0;

        const staffHeight = staffCount > 0 ? staffCount * 5 : 5;
        const equipmentHeight = equipmentCount > 0 ? equipmentCount * 5 : 5;
        const socketHeight = socketCount > 0 ? Math.ceil(socketCount / 6) * 5 : 0;

        const neededHeight = 12 + 6 + 5 + staffHeight + 5 + equipmentHeight + (socketHeight > 0 ? (5 + socketHeight) : 0) + 12;

        checkPageOverflow(neededHeight);

        // Header for this room block
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(37, 99, 235); // primary blue
        doc.text(`${index + 1}. Salle ${room.name} (${room.room_type_label || 'Local'})`, margin, yPos);
        yPos += 6;

        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(71, 85, 105);
        doc.text(`Capacité maximale : ${room.max_capacity} personnes    |    Accès directs (portes) : ${room.doors}`, margin, yPos);
        yPos += 7;

        // Staff assigned
        doc.setFont("helvetica", "bold");
        doc.setTextColor(15, 23, 42);
        doc.text("Enseignant-Chercheurs affectés :", margin, yPos);
        yPos += 5;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(71, 85, 105);
        if (staffCount > 0) {
          room.staff.forEach((person: any) => {
            let info = "";
            if (person.email) info += ` - Email: ${person.email}`;
            if (person.phone) info += ` - Tél: ${person.phone}`;
            doc.text(`  • ${person.fullName}${info}`, margin, yPos);
            yPos += 5;
          });
        } else {
          doc.text("  • Aucun personnel affecté", margin, yPos);
          yPos += 5;
        }

        // Equipments
        yPos += 1;
        doc.setFont("helvetica", "bold");
        doc.setTextColor(15, 23, 42);
        doc.text("Matériels affectés :", margin, yPos);
        yPos += 5;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(71, 85, 105);
        if (equipmentCount > 0) {
          room.equipments.forEach((eq: any) => {
            const sn = eq.serial_number ? ` (S/N: ${eq.serial_number})` : "";
            const typeLbl = eq.equipment_type_label ? ` [${eq.equipment_type_label}]` : "";
            doc.text(`  • ${eq.name}${sn}${typeLbl}`, margin, yPos);
            yPos += 5;
          });
        } else {
          doc.text("  • Aucun matériel affecté", margin, yPos);
          yPos += 5;
        }

        // Sockets
        if (socketCount > 0) {
          yPos += 1;
          doc.setFont("helvetica", "bold");
          doc.setTextColor(15, 23, 42);
          doc.text("Prises & Connectiques :", margin, yPos);
          yPos += 5;
          doc.setFont("helvetica", "normal");
          doc.setTextColor(71, 85, 105);
          
          const socketLabels = room.sockets.map((s: any) => `${s.identifier} (${s.socket_type_label || 'Prise'})`);
          // Group sockets in lines of 5
          for (let i = 0; i < socketLabels.length; i += 5) {
            const lineSlice = socketLabels.slice(i, i + 5).join(', ');
            doc.text(`  ${lineSlice}${i + 5 < socketLabels.length ? ',' : ''}`, margin, yPos);
            yPos += 5;
          }
        }

        // Room block separator
        yPos += 3;
        doc.setDrawColor(226, 232, 240); // slate-200
        doc.setLineWidth(0.2);
        doc.line(margin, yPos, 297 - margin, yPos);
        yPos += 8;
      });
    }

    // Save the PDF
    const filename = `Etat_Etage_${level === 0 ? 'RDC' : level}.pdf`;
    doc.save(filename);
    this.notificationService.showSuccess(`PDF ${filename} téléchargé avec succès.`);
  }
}
