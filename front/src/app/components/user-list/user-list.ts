import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, User } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-list.html',
  styleUrls: ['./user-list.css']
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  newUser: User = { login: '', password: '', is_admin: false };
  loading = false;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur lors du chargement des utilisateurs:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onAddUser() {
    if (!this.newUser.login || !this.newUser.password) return;
    
    this.userService.addUser(this.newUser).subscribe({
      next: () => {
        this.loadUsers();
        this.newUser = { login: '', password: '', is_admin: false };
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erreur lors de l\'ajout:', err)
    });
  }

  onDeleteUser(id: string) {
    const userToDelete = this.users.find(u => u.id === id);
    if (!userToDelete) return;

    const admins = this.users.filter(u => u.is_admin);
    if (admins.length <= 1 && userToDelete.is_admin) {
      alert('Vous ne pouvez pas supprimer le dernier administrateur.');
      return;
    }

    if (confirm('Supprimer cet utilisateur ?')) {
      this.userService.deleteUser(id).subscribe({
        next: () => {
          const currentUserId = this.authService.currentUser?.id;
          if (currentUserId && currentUserId === id) {
            this.authService.logoutBackend(id).subscribe({
              next: () => this.authService.logout(),
              error: () => this.authService.logout()
            });
            return;
          }

          this.loadUsers();
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Erreur lors de la suppression:', err)
      });
    }
  }
}
