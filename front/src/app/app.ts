import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapComponent } from './components/map/map.component';
import { FloorManagerComponent } from './components/floor-manager/floor-manager';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, MapComponent, FloorManagerComponent],
  template: `
    <nav class="top-nav">
      <div class="nav-brand">LocauxAdmin</div>
      <div class="nav-links">
        <button [class.active]="view === 'map'" (click)="view = 'map'">Plan 2D</button>
        <button [class.active]="view === 'floors'" (click)="view = 'floors'">Gestion Étages</button>
      </div>
    </nav>
    
    <main>
      <app-map *ngIf="view === 'map'"></app-map>
      <app-floor-manager *ngIf="view === 'floors'"></app-floor-manager>
    </main>
  `,
  styles: [`
    .top-nav {
      height: 64px;
      background: #0f172a;
      display: flex;
      align-items: center;
      padding: 0 40px;
      gap: 40px;
      color: white;
    }
    .nav-brand {
      font-weight: 800;
      font-size: 20px;
    }
    .nav-links {
      display: flex;
      gap: 16px;
    }
    .nav-links button {
      background: transparent;
      border: none;
      color: #94a3b8;
      font-weight: 600;
      cursor: pointer;
      padding: 8px 16px;
      border-radius: 8px;
      transition: all 0.2s;
    }
    .nav-links button:hover {
      color: white;
      background: rgba(255,255,255,0.1);
    }
    .nav-links button.active {
      color: white;
      background: rgba(255,255,255,0.2);
    }
    main {
      height: calc(100vh - 64px);
    }
  `]
})
export class App {
  view: 'map' | 'floors' = 'map';
}
