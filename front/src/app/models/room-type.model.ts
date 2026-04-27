export class RoomType {
  id: string;
  label: string;

  constructor(data: any) {
    this.id = data.id;
    this.label = data.label;
  }
}
