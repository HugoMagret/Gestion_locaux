import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);
  
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Une erreur inconnue est survenue';
      
      if (error.error instanceof ErrorEvent) {
        errorMessage = `Erreur client : ${error.error.message}`;
      } else {
        errorMessage = error.error?.message || `Erreur ${error.status} : ${error.statusText}`;
      }

      notificationService.showError(errorMessage);
      return throwError(() => error);
    })
  );
};
