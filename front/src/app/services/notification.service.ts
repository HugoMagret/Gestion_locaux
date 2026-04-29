import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Notification {
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new BehaviorSubject<Notification | null>(null);
  public notification$ = this.notificationSubject.asObservable();

  showError(message: string) {
    this.notificationSubject.next({ message, type: 'error' });
    this.autoClose();
  }

  showSuccess(message: string) {
    this.notificationSubject.next({ message, type: 'success' });
    this.autoClose();
  }

  clear() {
    this.notificationSubject.next(null);
  }

  private autoClose() {
    setTimeout(() => this.clear(), 3000);
  }
}
