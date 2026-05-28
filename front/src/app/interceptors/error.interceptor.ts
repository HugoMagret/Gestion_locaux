import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);
  const authService = inject(AuthService);
  const router = inject(Router);
  const zone = inject(NgZone);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Une erreur inconnue est survenue';

      if (error.error instanceof ErrorEvent) {
        errorMessage = `Erreur client : ${error.error.message}`;
      } else {
        errorMessage = error.error?.message || `Erreur ${error.status} : ${error.statusText}`;
      }

      if (error.status === 401 && !req.url.includes('/auth/login')) {
        zone.run(() => {
          authService.logout();
          router.navigate(['/login']);
          notificationService.showError('Session expirée ou invalide. Veuillez vous reconnecter.');
        });
      } else {
        zone.run(() => notificationService.showError(errorMessage));
      }
      return throwError(() => error);
    })
  );
};
