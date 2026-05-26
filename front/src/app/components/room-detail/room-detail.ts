import { Component, Input, Output, EventEmitter, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
// Importation des deux types de modules de formulaires pour éviter les erreurs NG8002
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Room } from '../../models/room.model';
import { RoomType } from '../../models/room-type.model';
import { Staff } from '../../models/staff.model';
import { Equipment } from '../../models/equipment.model';
import { Socket } from '../../models/socket.model';
import { EquipmentType } from '../../models/equipment-type.model';
import { SocketType } from '../../models/socket-type.model';

import { RoomService } from '../../services/room.service';
import { ReferenceService } from '../../services/reference.service';
import { FloorService } from '../../services/floor.service';
import { StaffService } from '../../services/staff.service';
import { EquipmentService } from '../../services/equipment.service';
import { SocketService } from '../../services/socket.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-room-detail',
  standalone: true,
  // Ajout de FormsModule pour [ngModel] et ReactiveFormsModule pour [formGroup]
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './room-detail.html',
  styleUrls: ['./room-detail.css']
})
export class RoomDetailComponent implements OnInit {
  @Input() roomId!: string;
  @Output() back = new EventEmitter<void>();

  // Injection des services
  private fb = inject(FormBuilder);
  private roomService = inject(RoomService);
  private referenceService = inject(ReferenceService);
  private floorService = inject(FloorService);
  private staffService = inject(StaffService);
  private equipmentService = inject(EquipmentService);
  private socketService = inject(SocketService);
  private cdr = inject(ChangeDetectorRef);
  private notificationService = inject(NotificationService);

  // Propriétés de l'interface
  room: Room | null = null;
  activeTab: 'general' | 'staff' | 'equipment' | 'sockets' = 'general';
  isSaving = false;

  // Données de référence
  roomTypes: RoomType[] = [];
  availableFloors: number[] = [];
  equipmentTypes: EquipmentType[] = [];
  socketTypes: SocketType[] = [];
  allStaff: Staff[] = [];

  // États des formulaires (utilisés par votre HTML actuel)
  // On les déclare pour corriger l'erreur TS2339
  editData: any = {};
  newEquipment: any = { name: '', serial_number: '', equipment_type_id: '' };
  newSocket: any = { identifier: '', socket_type_id: '' };
  selectedStaffId: string = '';
  editingStaff: any = null;

  // Nouveau : Formulaire réactif pour une meilleure validation
  roomForm: FormGroup;

  constructor() {
    this.roomForm = this.fb.group({
      name: ['', Validators.required],
      max_capacity: [0, [Validators.required, Validators.min(1)]],
      room_type_id: ['', Validators.required],
      doors: [1, Validators.required],
      floor: [0],
      color: ['#3498db']
    });
  }

  ngOnInit(): void {
    this.loadReferences();
    this.loadRoom();
  }

  loadReferences(): void {
    this.referenceService.getRoomTypes().subscribe(types => {
      this.roomTypes = types;
      this.cdr.detectChanges();
    });
    this.referenceService.getEquipmentTypes().subscribe(types => {
      this.equipmentTypes = types;
      this.cdr.detectChanges();
    });
    this.referenceService.getSocketTypes().subscribe(types => {
      this.socketTypes = types;
      this.cdr.detectChanges();
    });
    this.floorService.getFloors().subscribe(floors => {
      this.availableFloors = [...new Set(floors.map(f => f.level))].sort((a, b) => a - b);
      this.cdr.detectChanges();
    });
    this.staffService.getStaff().subscribe(staff => {
      this.allStaff = staff;
      this.cdr.detectChanges();
    });
  }

  loadRoom(): void {
    this.roomService.getRoomById(this.roomId).subscribe({
      next: (room) => {
        this.room = room;
        if (!this.isSaving) {
          this.editData = { ...room };
          this.roomForm.patchValue(room);
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  saveGeneral(): void {
    if (!this.room) return;
    this.isSaving = true;

    const updatedData = { ...this.room, ...this.editData };

    this.roomService.updateRoom(updatedData).subscribe({
      next: (savedRoom) => {
        this.room = savedRoom;
        this.editData = { ...savedRoom };
        this.roomForm.patchValue(savedRoom);
        this.isSaving = false;
        this.cdr.detectChanges();
        this.notificationService.showSuccess('Salle mise à jour !');
      },
      error: (err) => {
        console.error(err);
        this.isSaving = false;
        this.cdr.detectChanges();
        this.notificationService.showError('Erreur lors de la sauvegarde');
      }
    });
  }

  // --- Gestion du Personnel (Assignation) ---
  assignStaff(): void {
    if (!this.selectedStaffId || !this.room) return;
    const staff = this.allStaff.find(s => s.id === this.selectedStaffId);
    if (staff) {
      staff.room_id = this.room.id;
      this.staffService.updateStaff(staff).subscribe(() => {
        this.loadRoom();
        this.selectedStaffId = '';
      });
    }
  }

  unassignStaff(staffId: string): void {
    const staff = this.allStaff.find(s => s.id === staffId);
    if (staff) {
      staff.room_id = null;
      this.staffService.updateStaff(staff).subscribe(() => this.loadRoom());
    }
  }

  // --- Gestion du Matériel (CRUD) ---
  addEquipment(): void {
    if (!this.newEquipment.name || !this.room) return;
    const equipment = new Equipment({
      ...this.newEquipment,
      room_id: this.room.id
    });
    this.equipmentService.addEquipment(equipment).subscribe(() => {
      this.loadRoom();
      this.newEquipment = { name: '', serial_number: '', equipment_type_id: '' };
    });
  }

  deleteEquipment(id: string): void {
    this.equipmentService.deleteEquipment(id).subscribe(() => this.loadRoom());
  }

  // --- Gestion des Prises (CRUD) ---
  addSocket(): void {
    if (!this.newSocket.identifier || !this.room) return;
    const socket = new Socket({
      ...this.newSocket,
      room_id: this.room.id
    });
    this.socketService.addSocket(socket).subscribe(() => {
      this.loadRoom();
      this.newSocket = { identifier: '', socket_type_id: '' };
    });
  }

  deleteSocket(id: string): void {
    this.socketService.deleteSocket(id).subscribe(() => this.loadRoom());
  }

  openEditStaffModal(person: Staff): void {
    this.editingStaff = { 
      ...person,
      room_id: person.room_id || (this.room ? this.room.id : null)
    };
    this.cdr.detectChanges();
  }

  closeEditStaffModal(): void {
    this.editingStaff = null;
    this.cdr.detectChanges();
  }

  saveStaff(): void {
    if (!this.editingStaff) return;
    this.staffService.updateStaff(new Staff(this.editingStaff)).subscribe({
      next: () => {
        this.notificationService.showSuccess('Coordonnées du personnel mises à jour !');
        this.closeEditStaffModal();
        this.loadRoom();
        this.staffService.getStaff().subscribe(staff => {
          this.allStaff = staff;
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        this.notificationService.showError("Erreur lors de la mise à jour : " + (err.error?.error || err.message));
      }
    });
  }

  goBack(): void {
    this.back.emit();
  }
}