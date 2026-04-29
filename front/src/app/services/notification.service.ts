import { Injectable, NgZone } from '@angular/core';
import { Subject } from 'rxjs';

export interface Notification {
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new Subject<Notification | null>();
  public notification$ = this.notificationSubject.asObservable();

  constructor(private zone: NgZone) {}

  showError(message: string) {
    this.zone.run(() => {
      this.notificationSubject.next({ message, type: 'error' });
      this.autoClose();
    });
  }

  showSuccess(message: string) {
    this.zone.run(() => {
      this.notificationSubject.next({ message, type: 'success' });
      this.autoClose();
    });
  }

  clear() {
    this.zone.run(() => {
      this.notificationSubject.next(null);
    });
  }

  private autoClose() {
    setTimeout(() => {
      this.clear();
    }, 3000);
  }
}
