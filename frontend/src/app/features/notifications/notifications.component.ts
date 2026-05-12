import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { NotificationService } from '../../core/services/notification.service';
import { Notification } from '../../core/models/models';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <div class="page-enter">
      <div class="page-header-row">
        <div>
          <h2 class="page-title-text">Notifications</h2>
          <p class="text-muted text-sm">Stay updated with budget alerts and activity</p>
        </div>
        <div class="header-actions" *ngIf="notifService.unreadCount() > 0">
          <button class="btn btn-secondary" (click)="notifService.markAllRead()">
            <span class="material-icons-round" style="font-size:16px">done_all</span>
            Mark all as read
          </button>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="filter-tabs">
        <button class="chip" [class.active]="filter() === 'all'" (click)="filter.set('all')">All</button>
        <button class="chip" [class.active]="filter() === 'unread'" (click)="filter.set('unread')">
          Unread
          <span class="badge badge-primary" *ngIf="notifService.unreadCount() > 0">{{ notifService.unreadCount() }}</span>
        </button>
        <button class="chip" [class.active]="filter() === 'BudgetAlert'" (click)="filter.set('BudgetAlert')">Budget Alerts</button>
        <button class="chip" [class.active]="filter() === 'BudgetBreached'" (click)="filter.set('BudgetBreached')">Breached</button>
      </div>

      <!-- Notification List -->
      <div class="notif-full-list glass-card">
        <div *ngFor="let n of filteredNotifs()"
             class="notif-full-item"
             [class.unread]="!n.isRead">

          <div class="notif-icon-lg" [class]="getIconClass(n.type)">
            <span class="material-icons-round">{{ getIcon(n.type) }}</span>
          </div>

          <div class="notif-content">
            <div class="notif-header-row">
              <h4 class="notif-title">{{ n.title }}</h4>
              <div class="notif-meta">
                <span class="text-xs text-muted">{{ n.sentAt | date:'MMM d, h:mm a' }}</span>
                <div class="unread-indicator" *ngIf="!n.isRead"></div>
              </div>
            </div>
            <p class="notif-message text-muted text-sm">{{ n.message }}</p>
            <div class="notif-type-badge">
              <span class="badge" [class]="getTypeBadge(n.type)">{{ n.type }}</span>
            </div>
          </div>

          <div class="notif-actions">
            <button class="btn btn-ghost btn-sm" *ngIf="!n.isRead" (click)="markRead(n.notificationId)">
              Mark read
            </button>
            <button class="btn btn-icon" style="color:var(--color-danger)" (click)="delete(n.notificationId)">
              <span class="material-icons-round" style="font-size:16px">delete</span>
            </button>
          </div>
        </div>

        <div class="empty-state" *ngIf="filteredNotifs().length === 0">
          <span class="empty-state__icon">🔔</span>
          <p class="empty-state__title">{{ filter() === 'unread' ? 'All caught up!' : 'No notifications' }}</p>
          <p class="empty-state__desc">{{ filter() === 'unread' ? 'You have no unread notifications.' : 'Notifications will appear here.' }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header-row { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: var(--space-xl); flex-wrap: wrap; gap: var(--space-md); }
    .page-title-text { font-size: 24px; font-weight: 700; margin-bottom: 4px; }
    .filter-tabs { display: flex; gap: var(--space-sm); margin-bottom: var(--space-lg); flex-wrap: wrap; }
    .notif-full-list { overflow: hidden; }
    .notif-full-item { display: flex; align-items: flex-start; gap: var(--space-md); padding: var(--space-lg); border-bottom: 1px solid var(--color-border); transition: background var(--transition-fast); &:last-child { border-bottom: none; } &:hover { background: rgba(255,255,255,0.02); } &.unread { background: rgba(108,99,255,0.04); } }
    .notif-icon-lg { width: 44px; height: 44px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; flex-shrink: 0; .material-icons-round { font-size: 20px; } &.warning { background: rgba(255,179,71,0.15); color: var(--color-warning); } &.danger { background: rgba(255,107,138,0.15); color: var(--color-danger); } &.info { background: rgba(79,172,254,0.15); color: var(--color-info); } }
    .notif-content { flex: 1; }
    .notif-header-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
    .notif-title { font-size: 14px; font-weight: 600; }
    .notif-meta { display: flex; align-items: center; gap: 8px; }
    .unread-indicator { width: 8px; height: 8px; background: var(--color-primary); border-radius: 50%; }
    .notif-message { font-size: 13px; margin-bottom: 8px; }
    .notif-actions { display: flex; align-items: center; gap: 4px; }
  `]
})
export class NotificationsComponent implements OnInit {
  notifService = inject(NotificationService);
  filter = signal<string>('all');

  ngOnInit(): void {
    this.notifService.getNotifications().subscribe();
  }

  filteredNotifs(): Notification[] {
    const all = this.notifService.notifications();
    const f = this.filter();
    if (f === 'all')    return all;
    if (f === 'unread') return all.filter(n => !n.isRead);
    return all.filter(n => n.type === f);
  }

  markRead(id: string): void { this.notifService.markRead(id).subscribe(); }
  delete(id: string): void   { this.notifService.deleteNotification(id).subscribe(); }

  getIcon(type: string): string {
    return type === 'BudgetBreached' ? 'dangerous' : type === 'BudgetAlert' ? 'warning' : 'notifications';
  }

  getIconClass(type: string): string {
    return type === 'BudgetBreached' ? 'danger' : type === 'BudgetAlert' ? 'warning' : 'info';
  }

  getTypeBadge(type: string): string {
    return type === 'BudgetBreached' ? 'badge badge-danger' : type === 'BudgetAlert' ? 'badge badge-warning' : 'badge badge-info';
  }
}
