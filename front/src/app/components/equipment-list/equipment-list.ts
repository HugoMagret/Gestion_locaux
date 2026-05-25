import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { combineLatest, map, BehaviorSubject, Observable, switchMap } from 'rxjs';
import { EquipmentService } from '../../services/equipment.service';
import { RoomService } from '../../services/room.service';
import { ReferenceService } from '../../services/reference.service';
import { NotificationService } from '../../services/notification.service';
import { Equipment } from '../../models/equipment.model';
import { Room } from '../../models/room.model';
import { EquipmentType } from '../../models/equipment-type.model';

@Component({
  selector: 'app-equipment-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './equipment-list.html',
  styleUrls: ['./equipment-list.css']
})
export class EquipmentListComponent implements OnInit {
  private refreshEquipment$ = new BehaviorSubject<void>(undefined);
  equipmentWithRooms$!: Observable<any[]>;
  rooms$!: Observable<Room[]>;
  equipmentTypes: EquipmentType[] = [];

  newEquipment = {
    name: '',
    serial_number: '',
    equipment_type_id: '',
    room_id: ''
  };

  editingEquipment: any = null;

  constructor(
    private equipmentService: EquipmentService,
    private roomService: RoomService,
    private referenceService: ReferenceService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.roomService.refreshRooms();
    this.rooms$ = this.roomService.getRooms();

    this.referenceService.getEquipmentTypes().subscribe({
      next: (types) => {
        this.equipmentTypes = types;
        this.cdr.detectChanges();
      }
    });

    this.equipmentWithRooms$ = this.refreshEquipment$.pipe(
      switchMap(() => combineLatest({
        equipment: this.equipmentService.getAllEquipment(),
        rooms: this.rooms$
      })),
      map(({ equipment, rooms }) => equipment.map(item => ({
        ...item,
        room: rooms.find(room => room.id === item.room_id)
      })))
    );
  }

  loadData(): void {
    this.roomService.refreshRooms();
    this.refreshEquipment$.next();
  }

  addEquipment(): void {
    if (!this.newEquipment.name.trim() || !this.newEquipment.equipment_type_id) {
      return;
    }

    const payload = { ...this.newEquipment, room_id: this.newEquipment.room_id || null };
    this.equipmentService.addEquipment(new Equipment(payload)).subscribe({
      next: () => {
        this.newEquipment = { name: '', serial_number: '', equipment_type_id: '', room_id: '' };
        this.loadData();
        this.notificationService.showSuccess('Matériel ajouté avec succès !');
      },
      error: (err) => {
        console.error('Erreur lors de l\'ajout du matériel:', err);
        this.notificationService.showError('Erreur lors de l\'ajout du matériel');
      }
    });
  }

  openEditEquipmentModal(item: any): void {
    this.editingEquipment = {
      ...item,
      room_id: item.room_id || ''
    };
    this.cdr.detectChanges();
  }

  closeEditEquipmentModal(): void {
    this.editingEquipment = null;
    this.cdr.detectChanges();
  }

  saveEquipment(): void {
    if (!this.editingEquipment) return;

    const payload = { ...this.editingEquipment, room_id: this.editingEquipment.room_id || null };
    this.equipmentService.updateEquipment(new Equipment(payload)).subscribe({
      next: () => {
        this.notificationService.showSuccess('Matériel mis à jour !');
        this.closeEditEquipmentModal();
        this.loadData();
      },
      error: (err) => {
        console.error('Erreur lors de la mise à jour du matériel:', err);
        this.notificationService.showError('Erreur lors de la mise à jour du matériel');
      }
    });
  }

  deleteEquipment(id: string): void {
    if (!confirm('Supprimer ce matériel ?')) return;

    this.equipmentService.deleteEquipment(id).subscribe({
      next: () => this.loadData(),
      error: (err) => {
        console.error('Erreur lors de la suppression du matériel:', err);
        this.notificationService.showError('Erreur lors de la suppression du matériel');
      }
    });
  }
}