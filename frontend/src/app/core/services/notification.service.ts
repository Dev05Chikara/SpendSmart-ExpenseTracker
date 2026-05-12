import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';
import { Notification } from '../models/models';
import { environment } from '../../../environments/environment';
import { mapNotification, unwrapData } from './backend-response';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  notifications = signal<Notification[]>([]);
  unreadCount = signal<number>(0);
  private pollHandle: number | null = null;

  constructor(private http: HttpClient) {}

  // ── REST ─────────────────────────────────────────────────────
  getNotifications(): Observable<Notification[]> {
    return this.http.get<any>(`${environment.apiGateway}/notifications`).pipe(
      map(response => (unwrapData<any[]>(response) ?? []).map(mapNotification)),
      tap(list => {
        this.notifications.set(list);
        this.unreadCount.set(list.filter(n => !n.isRead).length);
      })
    );
  }

  markRead(id: string): Observable<void> {
    return this.http.put<any>(`${environment.apiGateway}/notifications/${id}/read`, {}).pipe(
      tap(() => {
        this.notifications.update(list =>
          list.map(n => n.notificationId === id ? { ...n, isRead: true } : n)
        );
        this.unreadCount.update(c => Math.max(0, c - 1));
      })
    );
  }

  deleteNotification(id: string): Observable<void> {
    return this.http.delete<any>(`${environment.apiGateway}/notifications/${id}`).pipe(
      tap(() => {
        const removed = this.notifications().find(n => n.notificationId === id);
        this.notifications.update(list => list.filter(n => n.notificationId !== id));
        if (removed && !removed.isRead) this.unreadCount.update(c => Math.max(0, c - 1));
      })
    );
  }

  markAllRead(): void {
    const unread = this.notifications().filter(n => !n.isRead);
    unread.forEach(n => this.markRead(n.notificationId).subscribe());
  }

  // ── REST polling ──────────────────────────────────────────────
  startSignalR(): void {
    this.stopSignalR();
    void this.refreshNotifications();
    this.pollHandle = window.setInterval(() => {
      void this.refreshNotifications();
    }, 30000);
  }

  stopSignalR(): void {
    if (this.pollHandle !== null) {
      window.clearInterval(this.pollHandle);
      this.pollHandle = null;
    }
  }

  private refreshNotifications(): Promise<void> {
    return new Promise(resolve => {
      this.getNotifications().subscribe({
        next: () => resolve(),
        error: () => resolve()
      });
    });
  }
}
