export class Socket {
  id: string;
  identifier: string;
  socket_type_id: string;
  room_id: string;
  
  // Joined field
  socket_type_label?: string;

  constructor(data: any) {
    this.id = data.id;
    this.identifier = data.identifier;
    this.socket_type_id = data.socket_type_id;
    this.room_id = data.room_id;
    this.socket_type_label = data.socket_type_label;
  }
}
