export class Staff {
  id: string;
  first_name: string;
  last_name: string;
  room_id: string | null;

  constructor(data: any) {
    this.id = data.id;
    this.first_name = data.first_name;
    this.last_name = data.last_name;
    this.room_id = data.room_id;
  }

  get fullName(): string {
    return `${this.first_name} ${this.last_name}`;
  }
}
