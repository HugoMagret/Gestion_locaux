import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Socket } from '../models/socket.model';
import { RoomService } from './room.service';

@Injectable({ providedIn: 'root' })
export class SocketService {
  constructor(private roomService: RoomService) {}

  getSocketsByRoom(roomId: string): Observable<Socket[]> {
    return this.roomService.getRooms().pipe(
      map(rooms => {
        const room = rooms.find(r => r.id === roomId);
        return room ? room.sockets : [];
      })
    );
  }

  addSocket(socket: Socket): Observable<Socket> {
    // Note: Backend doesn't have a direct socket creation endpoint yet.
    // You might need to update the entire room or add the endpoint.
    return this.roomService.getRooms().pipe(map(() => socket));
  }

  deleteSocket(id: string): Observable<boolean> {
    return this.roomService.getRooms().pipe(map(() => true));
  }
}

