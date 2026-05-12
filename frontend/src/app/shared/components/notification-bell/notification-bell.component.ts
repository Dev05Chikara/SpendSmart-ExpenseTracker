import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NotificationService } from '../../../core/services/notification.service';
import { ClickOutsideDirective } from '../../directives/click-outside.directive';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule, RouterLink, ClickOutsideDirective],
  template: `
    <div class="notification-bell" (clickOutside)="isOpen.set(false)">
      <button class="btn btn-icon bell-btn" (click)="toggleDropdown()" title="Notifications">
        <span class="material-icons-round">notifications</span>
        <span class="badge-dot" *ngIf="notifService.unreadCount() > 0">
          {{ notifService.unreadCount() > 9 ? '9+' : notifService.unreadCount() }}
        </span>
      </button>

      <div class="notif-dropdown" *ngIf="isOpen()">
        <div class="notif-dropdown__header">
          <span class="font-bold" style="font-size:15px">Notifications</span>
          <button class="btn btn-ghost btn-sm" (click)="markAll()" *ngIf="notifService.unreadCount() > 0">
            Mark all read
          </button>
        </div>

        <div class="notif-list">
          <div *ngIf="notifService.notifications().length === 0" class="empty-notif">
            <span class="material-icons-round" style="font-size:32px;opacity:0.3">notifications_none</span>
            <span class="text-muted text-sm">No notifications</span>
          </div>

          <div *ngFor="let n of notifService.notifications().slice(0, 5)"
               class="notif-item"
               [class.unread]="!n.isRead"
               (click)="markRead(n.notificationId)">
            <div class="notif-icon" [ngClass]="getIconClass(n.type)">
              <span class="material-icons-round" style="font-size:16px">{{ getIcon(n.type) }}</span>
            </div>
            <div class="notif-body">
              <p class="notif-title">{{ n.title }}</p>
              <p class="notif-msg text-sm text-muted">{{ n.message }}</p>
              <p class="notif-time text-xs text-muted">{{ n.sentAt | date:'short' }}</p>
            </div>
            <div class="unread-dot" *ngIf="!n.isRead"></div>
          </div>
        </div>

        <a routerLink="/notifications" class="notif-footer" (click)="isOpen.set(false)">
          View all notifications
          <span class="material-icons-round" style="font-size:16px">arrow_forward</span>
        </a>
      </div>
    </div>
  `,
  styles: [`
    .notification-bell { position: relative; }

    .bell-btn {
      position: relative;
      color: var(--text-secondary);
      &:hover { color: var(--text-primary); }
    }

    .badge-dot {
      position: absolute;
      top: 3px; right: 3px;
      background: var(--color-danger);
      color: #fff;
      font-size: 9px;
      font-weight: 700;
      min-width: 16px; height: 16px;
      border-radius: 999px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid var(--color-bg);
      padding: 0 3px;
    }

    .notif-dropdown {
      position: absolute;
      top: calc(100% + 10px);
      right: 0;
      width: 340px;
      background: #1A1A2E;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      z-index: 1000;
      animation: fadeIn var(--transition-fast);
      overflow: hidden;
    }

    .notif-dropdown__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 16px;
      border-bottom: 1px solid var(--color-border);
    }

    .notif-list { max-height: 320px; overflow-y: auto; }

    .empty-notif {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 32px 16px;
    }

    .notif-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px 16px;
      cursor: pointer;
      transition: background var(--transition-fast);
      position: relative;

      &:hover { background: rgba(255,255,255,0.03); }
      &.unread { background: rgba(108,99,255,0.05); }
    }

    .notif-icon {
      width: 32px; height: 32px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      &.warning { background: rgba(255,179,71,0.15); color: var(--color-warning); }
      &.danger  { background: rgba(255,107,138,0.15); color: var(--color-danger); }
      &.info    { background: rgba(79,172,254,0.15); color: var(--color-info); }
    }

    .notif-body { flex: 1; overflow: hidden; }
    .notif-title { font-size: 13px; font-weight: 600; margin-bottom: 2px; }
    .notif-msg   { font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .notif-time  { font-size: 11px; margin-top: 4px; }

    .unread-dot {
      width: 7px; height: 7px;
      background: var(--color-primary);
      border-radius: 999px;
      flex-shrink: 0;
      margin-top: 4px;
    }

    .notif-footer {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 12px;
      border-top: 1px solid var(--color-border);
      font-size: 13px;
      color: var(--color-primary-light);
      font-weight: 500;
      transition: background var(--transition-fast);

      &:hover { background: rgba(108,99,255,0.08); }
    }
  `]
})
export class NotificationBellComponent {
  notifService = inject(NotificationService);
  isOpen = signal(false);

  toggleDropdown(): void { this.isOpen.update(v => !v); }

  markRead(id: string): void {
    this.notifService.markRead(id).subscribe();
  }

  markAll(): void {
    this.notifService.markAllRead();
  }

  getIcon(type: string): string {
    const icons: Record<string, string> = {
      BudgetAlert: 'warning',
      BudgetBreached: 'dangerous',
      General: 'info'
    };
    return icons[type] ?? 'notifications';
  }

  getIconClass(type: string): string {
    const classes: Record<string, string> = {
      BudgetAlert: 'warning',
      BudgetBreached: 'danger',
      General: 'info'
    };
    return classes[type] ?? 'info';
  }
}
