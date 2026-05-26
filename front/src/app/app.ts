import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapComponent } from './components/map/map';
import { Map3dComponent } from './components/map3d/map3d';
import { FloorManagerComponent } from './components/floor-manager/floor-manager';
import { StaffListComponent } from './components/staff-list/staff-list';
import { RoomTypeManagerComponent } from './components/room-type-manager/room-type-manager';
import { EquipmentTypeManagerComponent } from './components/equipment-type-manager/equipment-type-manager';
import { RoomListComponent } from './components/room-list/room-list';
import { EquipmentListComponent } from './components/equipment-list/equipment-list';
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
    EquipmentListComponent,
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
  
  view: 'map' | 'map3d' | 'floors' | 'staff' | 'types' | 'equipment-types' | 'equipment' | 'rooms' | 'users' | 'profile' | 'room-detail' = 'map';
  previousView: 'map' | 'map3d' | 'floors' | 'staff' | 'types' | 'equipment-types' | 'equipment' | 'rooms' | 'users' | 'profile' = 'map';
  selectedRoomId: string | null = null;
  isAuthenticated$ = this.authService.isAuthenticated$;

  ngOnInit() {
    this.isAuthenticated$.subscribe((status: boolean) => {
      if (status) {
        this.view = 'map';
      }
    });
  }

  onRoomSelected(roomId: string) {
    this.previousView = this.view === 'room-detail' ? this.previousView : this.view;
    this.selectedRoomId = roomId;
    this.view = 'room-detail';
  }

  closeRoomDetail() {
    this.view = this.previousView;
    this.selectedRoomId = null;
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin;
  }

  logout() {
    this.previousView = 'map';
    this.view = 'map';
    this.authService.logout();
  }
}
