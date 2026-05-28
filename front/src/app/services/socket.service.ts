import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Socket } from '../models/socket.model';
import { API_URL } from '../api.config';

@Injectable({ providedIn: 'root' })
export class SocketService {
  constructor(private http: HttpClient) {}

  getAllSockets(): Observable<Socket[]> {
    return this.http.get<any[]>(`${API_URL}/sockets`).pipe(
      map(sockets => sockets.map(s => new Socket(s)))
    );
  }

  getSocketsByRoom(roomId: string): Observable<Socket[]> {
    return this.getAllSockets().pipe(
      map(sockets => sockets.filter(s => s.room_id === roomId))
    );
  }

  addSocket(socket: Socket): Observable<Socket> {
    return this.http.post<any>(`${API_URL}/sockets`, socket).pipe(
      map(s => new Socket(s))
    );
  }

  updateSocket(socket: Socket): Observable<Socket> {
    return this.http.put<any>(`${API_URL}/sockets/${socket.id}`, socket).pipe(
      map(s => new Socket(s))
    );
  }

  deleteSocket(id: string): Observable<boolean> {
    return this.http.delete(`${API_URL}/sockets/${id}`).pipe(
      map(() => true)
    );
  }
}

