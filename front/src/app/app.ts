import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapComponent } from './components/map/map';
import { Map3dComponent } from './components/map3d/map3d';
import { FloorManagerComponent } from './components/floor-manager/floor-manager';
import { StaffListComponent } from './components/staff-list/staff-list';
import { RoomTypeManagerComponent } from './components/room-type-manager/room-type-manager';
import { EquipmentTypeManagerComponent } from './components/equipment-type-manager/equipment-type-manager';
import { RoomListComponent } from './components/room-list/room-list';
import { UserListComponent } from './components/user-list/user-list';
import { ProfileComponent } from './components/profile/profile';
import { AlertComponent } from './components/alert/alert';
import { LoginComponent } from './components/login/login';
import { RoomDetailComponent } from './components/room-detail/room-detail';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    MapComponent,
    Map3dComponent,
    FloorManagerComponent, 
    StaffListComponent, 
    RoomTypeManagerComponent, 
    EquipmentTypeManagerComponent, 
    RoomListComponent,
    UserListComponent,
    ProfileComponent,
    AlertComponent,
    LoginComponent,
    RoomDetailComponent
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit {
  private authService = inject(AuthService);
  
  view: 'map' | 'map3d' | 'floors' | 'staff' | 'types' | 'equipment-types' | 'rooms' | 'users' | 'profile' | 'room-detail' = 'map';
  selectedRoomId: string | null = null;
  isAuthenticated$ = this.authService.isAuthenticated$;

  ngOnInit() {
    this.isAuthenticated$.subscribe(status => {
      if (status) {
        this.view = 'map';
      }
    });
  }

  onRoomSelected(roomId: string) {
    this.selectedRoomId = roomId;
    this.view = 'room-detail';
  }

  closeRoomDetail() {
    this.view = 'rooms';
    this.selectedRoomId = null;
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin;
  }

  logout() {
    this.view = 'map';
    this.authService.logout();
  }
}
