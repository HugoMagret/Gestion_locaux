import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, User } from '../../services/user.service';

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
    if (confirm('Supprimer cet utilisateur ?')) {
      this.userService.deleteUser(id).subscribe({
        next: () => {
          this.loadUsers();
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Erreur lors de la suppression:', err)
      });
    }
  }
}
