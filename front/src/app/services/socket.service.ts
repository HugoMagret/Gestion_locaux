import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Socket } from '../models/socket.model';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private mockSockets: Socket[] = [
    new Socket({ id: 'p1', identifier: 'ETH-01', socket_type_id: 'st1', room_id: '1' }),
    new Socket({ id: 'p2', identifier: 'TEL-01', socket_type_id: 'st2', room_id: '1' }),
    new Socket({ id: 'p3', identifier: 'ETH-02', socket_type_id: 'st1', room_id: '2' }),
  ];

  getSocketsByRoom(roomId: string): Observable<Socket[]> {
    return of(this.mockSockets.filter(s => s.room_id === roomId));
  }

  addSocket(socket: Socket): Observable<Socket> {
    this.mockSockets.push(socket);
    return of(socket);
  }

  deleteSocket(id: string): Observable<boolean> {
    this.mockSockets = this.mockSockets.filter(s => s.id !== id);
    return of(true);
  }
}
