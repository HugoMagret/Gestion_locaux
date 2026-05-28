import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReferenceService } from '../../services/reference.service';
import { SocketType } from '../../models/socket-type.model';

@Component({
  selector: 'app-socket-type-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './socket-type-manager.html',
  styleUrls: ['./socket-type-manager.css']
})
export class SocketTypeManagerComponent implements OnInit {
  socketTypes: SocketType[] = [];
  newTypeLabel: string = '';

  constructor(
    private referenceService: ReferenceService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadTypes();
  }

  loadTypes(): void {
    this.referenceService.getSocketTypes().subscribe({
      next: (types) => {
        this.socketTypes = types;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erreur lors du chargement des types de connectiques:', err)
    });
  }

  addType(): void {
    if (!this.newTypeLabel.trim()) return;

    this.referenceService.addSocketType(this.newTypeLabel).subscribe({
      next: () => {
        this.newTypeLabel = '';
        this.loadTypes();
      },
      error: (err) => console.error('Erreur lors de l\'ajout du type:', err)
    });
  }

  deleteType(id: string): void {
    if (confirm('Supprimer ce type de connectique ?')) {
      this.referenceService.deleteSocketType(id).subscribe({
        next: () => this.loadTypes(),
        error: (err) => console.error('Erreur lors de la suppression:', err)
      });
    }
  }
}