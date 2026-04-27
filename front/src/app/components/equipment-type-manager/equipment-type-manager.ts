import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReferenceService } from '../../services/reference.service';
import { EquipmentType } from '../../models/equipment-type.model';

@Component({
  selector: 'app-equipment-type-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './equipment-type-manager.html',
  styleUrls: ['./equipment-type-manager.css']
})
export class EquipmentTypeManagerComponent implements OnInit {
  equipmentTypes: EquipmentType[] = [];
  newTypeLabel: string = '';

  constructor(private referenceService: ReferenceService) {}

  ngOnInit(): void {
    this.loadTypes();
  }

  loadTypes(): void {
    this.referenceService.getEquipmentTypes().subscribe(types => {
      this.equipmentTypes = types;
    });
  }

  addType(): void {
    if (!this.newTypeLabel.trim()) return;

    this.referenceService.addEquipmentType(this.newTypeLabel).subscribe(() => {
      this.newTypeLabel = '';
      this.loadTypes();
    });
  }

  deleteType(id: string): void {
    if (confirm('Supprimer ce type de matériel ?')) {
      this.referenceService.deleteEquipmentType(id).subscribe(() => {
        this.loadTypes();
      });
    }
  }
}
