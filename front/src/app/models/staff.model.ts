export class Staff {
  id: string;
  last_name: string;
  first_name: string;
  room_id?: string;

  constructor(data: any) {
    this.id = data.id;
    this.last_name = data.last_name;
    this.first_name = data.first_name;
    this.room_id = data.room_id;
  }

  get fullName(): string {
    return `${this.first_name} ${this.last_name}`;
  }
}
