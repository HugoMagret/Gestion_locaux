import { SocketType } from './socket-type.model';

export class Socket {
  id: string;
  identifier: string;
  socket_type_id: string;
  socket_type?: SocketType;
  room_id: string;

  constructor(data: any) {
    this.id = data.id;
    this.identifier = data.identifier;
    this.socket_type_id = data.socket_type_id;
    this.room_id = data.room_id;
    if (data.socket_type) {
      this.socket_type = new SocketType(data.socket_type);
    }
  }
}
