import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

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
  currentPassword = '';
  message = '';
  error = '';

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  get currentUser() {
    return this.authService.currentUser;
  }

  onChangePassword() {
    this.error = '';
    this.message = '';

    if (this.newPassword !== this.confirmPassword) {
      this.error = 'Les mots de passe ne correspondent pas';
      this.notificationService.showError(this.error);
      this.cdr.detectChanges();
      return;
    }

    if (this.newPassword.length < 4) {
      this.error = 'Le mot de passe doit faire au moins 4 caractères';
      this.notificationService.showError(this.error);
      this.cdr.detectChanges();
      return;
    }

    if (!this.currentPassword) {
      this.error = 'Veuillez saisir votre mot de passe actuel';
      this.notificationService.showError(this.error);
      this.cdr.detectChanges();
      return;
    }

    this.authService.verifyCurrentPassword(this.currentPassword).subscribe({
      next: () => {
        this.authService.changePassword(this.newPassword).subscribe({
          next: () => {
            this.message = 'Mot de passe mis à jour avec succès';
            this.error = '';
            this.currentPassword = '';
            this.newPassword = '';
            this.confirmPassword = '';
            this.notificationService.showSuccess('Mot de passe mis à jour avec succès !');
            this.cdr.detectChanges();
          },
          error: (err) => {
            this.error = 'Erreur lors de la mise à jour';
            this.message = '';
            this.notificationService.showError(this.error);
            this.cdr.detectChanges();
          }
        });
      },
      error: (err) => {
        this.error = 'Mot de passe actuel incorrect';
        this.message = '';
        this.notificationService.showError(this.error);
        this.cdr.detectChanges();
      }
    });
  }
}
