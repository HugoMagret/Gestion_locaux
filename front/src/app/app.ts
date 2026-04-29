import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapComponent } from './components/map/map';
import { FloorManagerComponent } from './components/floor-manager/floor-manager';
import { StaffListComponent } from './components/staff-list/staff-list';
import { RoomTypeManagerComponent } from './components/room-type-manager/room-type-manager';
import { EquipmentTypeManagerComponent } from './components/equipment-type-manager/equipment-type-manager';
import { RoomListComponent } from './components/room-list/room-list';
import { UserListComponent } from './components/user-list/user-list';
import { ProfileComponent } from './components/profile/profile';
import { AlertComponent } from './components/alert/alert';
import { LoginComponent } from './components/login/login';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    MapComponent, 
    FloorManagerComponent, 
    StaffListComponent, 
    RoomTypeManagerComponent, 
    EquipmentTypeManagerComponent, 
    RoomListComponent,
    UserListComponent,
    ProfileComponent,
    AlertComponent,
    LoginComponent
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit {
  private authService = inject(AuthService);
  
  view: 'map' | 'floors' | 'staff' | 'types' | 'equipment-types' | 'rooms' | 'users' | 'profile' = 'map';
  isAuthenticated$ = this.authService.isAuthenticated$;

  ngOnInit() {
    this.isAuthenticated$.subscribe(status => {
      if (status) {
        this.view = 'map';
      }
    });
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin;
  }

  logout() {
    this.view = 'map';
    this.authService.logout();
  }
}
