export class Equipment {
  type: 'VIDEO_PROJ' | 'TABLEAU' | 'PRISE_RESEAU';
  label: string;
  socketNumber?: string;

  constructor(type: 'VIDEO_PROJ' | 'TABLEAU' | 'PRISE_RESEAU', label: string, socket?: string) {
    this.type = type;
    this.label = label;
    this.socketNumber = socket;
  }
}
