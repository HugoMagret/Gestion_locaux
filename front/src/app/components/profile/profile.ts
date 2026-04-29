import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class ProfileComponent {
  newPassword = '';
  confirmPassword = '';
  message = '';
  error = '';

  constructor(private authService: AuthService) {}

  get currentUser() {
    return this.authService.currentUser;
  }

  onChangePassword() {
    if (this.newPassword !== this.confirmPassword) {
      this.error = 'Les mots de passe ne correspondent pas';
      return;
    }

    if (this.newPassword.length < 4) {
      this.error = 'Le mot de passe doit faire au moins 4 caractères';
      return;
    }

    this.authService.changePassword(this.newPassword).subscribe({
      next: () => {
        this.message = 'Mot de passe mis à jour avec succès';
        this.error = '';
        this.newPassword = '';
        this.confirmPassword = '';
      },
      error: (err) => {
        this.error = 'Erreur lors de la mise à jour';
        this.message = '';
      }
    });
  }
}
