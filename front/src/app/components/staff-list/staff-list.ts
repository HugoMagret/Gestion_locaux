import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StaffService } from '../../services/staff.service';
import { RoomService } from '../../services/room.service';
import { NotificationService } from '../../services/notification.service';
import { Room } from '../../models/room.model';
import { Staff } from '../../models/staff.model';
import { Observable, combineLatest, map, BehaviorSubject, switchMap } from 'rxjs';

@Component({
  selector: 'app-staff-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './staff-list.html',
  styleUrls: ['./staff-list.css']
})
export class StaffListComponent implements OnInit {
  private refreshStaff$ = new BehaviorSubject<void>(undefined);
  staffWithRooms$!: Observable<any[]>;
  rooms$!: Observable<Room[]>;
  
  newStaff = {
    first_name: '',
    last_name: '',
    room_id: '',
    phone: '',
    email: ''
  };
  editingStaff: any = null;

  constructor(
    private staffService: StaffService,
    private roomService: RoomService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.roomService.refreshRooms();
    this.rooms$ = this.roomService.getRooms();
    
    this.staffWithRooms$ = this.refreshStaff$.pipe(
      switchMap(() => combineLatest({
        staff: this.staffService.getStaff(),
        rooms: this.rooms$
      })),
      map(({ staff, rooms }) => staff.map(s => ({
        ...s,
        room: rooms.find(r => r.id === s.room_id)
      })))
    );
  }

  loadData(): void {
    this.roomService.refreshRooms();
    this.refreshStaff$.next();
  }

  isValidPhone(phone: string): boolean {
    if (!phone) return true; // Optionnel
    return /^[0-9\s\-\+\(\)]{10,}$/.test(phone.replace(/\s/g, ''));
  }

  isValidEmail(email: string): boolean {
    if (!email) return true; // Optionnel
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  isFormValid(): boolean {
    return this.newStaff.first_name.trim() !== '' &&
           this.newStaff.last_name.trim() !== '' &&
           this.isValidPhone(this.newStaff.phone) &&
           this.isValidEmail(this.newStaff.email);
  }

  addStaff(): void {
    if (!this.isFormValid()) return;

    const staffData = { ...this.newStaff };
    if (!staffData.room_id) (staffData as any).room_id = null;

    this.staffService.addStaff(new Staff(staffData)).subscribe({
      next: () => {
        this.newStaff = { first_name: '', last_name: '', room_id: '', phone: '', email: '' };
        this.loadData();
      },
      error: (err) => {
        console.error('Erreur lors de l\'ajout du personnel:', err);
        this.notificationService.showError('Erreur lors de l\'ajout : ' + (err.error?.error || err.message));
      }
    });
  }

  deleteStaff(id: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce membre du personnel ?')) {
      this.staffService.deleteStaff(id).subscribe(() => {
        this.loadData();
      });
    }
  }

  openEditStaffModal(person: any): void {
    this.editingStaff = { ...person };
    this.cdr.detectChanges();
  }

  closeEditStaffModal(): void {
    this.editingStaff = null;
    this.cdr.detectChanges();
  }

  saveStaff(): void {
    if (!this.editingStaff) return;
    
    const staffData = { ...this.editingStaff };
    if (!staffData.room_id) staffData.room_id = null;

    this.staffService.updateStaff(new Staff(staffData)).subscribe({
      next: () => {
        this.notificationService.showSuccess('Informations du personnel mises à jour !');
        this.closeEditStaffModal();
        this.loadData();
      },
      error: (err) => {
        this.notificationService.showError("Erreur lors de la mise à jour : " + (err.error?.error || err.message));
      }
    });
  }
}
