import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { combineLatest, map, BehaviorSubject, Observable, switchMap } from 'rxjs';
import { SocketService } from '../../services/socket.service';
import { RoomService } from '../../services/room.service';
import { ReferenceService } from '../../services/reference.service';
import { NotificationService } from '../../services/notification.service';
import { Socket } from '../../models/socket.model';
import { Room } from '../../models/room.model';
import { SocketType } from '../../models/socket-type.model';

@Component({
  selector: 'app-socket-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './socket-list.html',
  styleUrls: ['./socket-list.css']
})
export class SocketListComponent implements OnInit {
  private refreshSockets$ = new BehaviorSubject<void>(undefined);
  socketsWithRooms$!: Observable<any[]>;
  rooms$!: Observable<Room[]>;
  socketTypes: SocketType[] = [];

  newSocket = {
    identifier: '',
    socket_type_id: '',
    room_id: ''
  };

  editingSocket: any = null;

  constructor(
    private socketService: SocketService,
    private roomService: RoomService,
    private referenceService: ReferenceService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.roomService.refreshRooms();
    this.rooms$ = this.roomService.getRooms();

    this.referenceService.getSocketTypes().subscribe({
      next: (types: SocketType[]) => {
        this.socketTypes = types;
        this.cdr.detectChanges();
      }
    });

    this.socketsWithRooms$ = this.refreshSockets$.pipe(
      switchMap(() => combineLatest({
        sockets: this.socketService.getAllSockets(),
        rooms: this.rooms$
      })),
      map(({ sockets, rooms }: { sockets: Socket[]; rooms: Room[] }) => sockets.map((item: Socket) => ({
        ...item,
        room: rooms.find((room: Room) => room.id === item.room_id)
      })))
    );
  }

  loadData(): void {
    this.roomService.refreshRooms();
    this.refreshSockets$.next();
  }

  addSocket(): void {
    if (!this.newSocket.identifier.trim() || !this.newSocket.socket_type_id) return;

    const payload = { ...this.newSocket, room_id: this.newSocket.room_id || null };
    this.socketService.addSocket(new Socket(payload)).subscribe({
      next: () => {
        this.newSocket = { identifier: '', socket_type_id: '', room_id: '' };
        this.loadData();
        this.notificationService.showSuccess('Connectique ajoutée avec succès !');
      },
      error: (err: any) => {
        console.error('Erreur lors de l\'ajout de la connectique:', err);
        this.notificationService.showError('Erreur lors de l\'ajout de la connectique');
      }
    });
  }

  openEditSocketModal(item: any): void {
    this.editingSocket = { ...item, room_id: item.room_id || '' };
    this.cdr.detectChanges();
  }

  closeEditSocketModal(): void {
    this.editingSocket = null;
    this.cdr.detectChanges();
  }

  saveSocket(): void {
    if (!this.editingSocket) return;

    const payload = { ...this.editingSocket, room_id: this.editingSocket.room_id || null };
    this.socketService.updateSocket(new Socket(payload)).subscribe({
      next: () => {
        this.notificationService.showSuccess('Connectique mise à jour !');
        this.closeEditSocketModal();
        this.loadData();
      },
      error: (err: any) => {
        console.error('Erreur lors de la mise à jour de la connectique:', err);
        this.notificationService.showError('Erreur lors de la mise à jour de la connectique');
      }
    });
  }

  deleteSocket(id: string): void {
    if (!confirm('Supprimer cette connectique ?')) return;

    this.socketService.deleteSocket(id).subscribe({
      next: () => this.loadData(),
      error: (err: any) => {
        console.error('Erreur lors de la suppression de la connectique:', err);
        this.notificationService.showError('Erreur lors de la suppression de la connectique');
      }
    });
  }
}
