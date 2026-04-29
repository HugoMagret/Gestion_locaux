import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, OnDestroy, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../services/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alert.html',
  styleUrls: ['./alert.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlertComponent implements OnInit, OnDestroy {
  notification: Notification | null = null;
  private sub!: Subscription;

  constructor(
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {}

  ngOnInit() {
    this.sub = this.notificationService.notification$.subscribe(notif => {
      // Force run inside Angular zone and trigger change detection immediately
      this.zone.run(() => {
        this.notification = notif;
        this.cdr.detectChanges();
      });
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  close() {
    this.notificationService.clear();
  }
}
