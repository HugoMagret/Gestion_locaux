export class RoomType {
  id: string;
  label: string;
  color: string;

  constructor(data: any) {
    this.id = data.id;
    this.label = data.label;
    this.color = data.color || '#3498db';
  }
}
