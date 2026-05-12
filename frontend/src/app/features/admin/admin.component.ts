import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AdminService } from '../../core/services/admin.service';
import { ToastService } from '../../core/services/toast.service';
import { User } from '../../core/models/models';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <div class="page-enter">
      <div class="page-header-row">
        <div>
          <h2 class="page-title-text">Admin Panel</h2>
          <p class="text-muted text-sm">Manage users and monitor platform activity</p>
        </div>
        <div class="admin-stats">
          <div class="stat-pill-sm">
            <span class="material-icons-round" style="font-size:14px;color:var(--color-success)">people</span>
            <span class="text-sm font-medium">{{ users().length }} Users</span>
          </div>
          <div class="stat-pill-sm">
            <span class="material-icons-round" style="font-size:14px;color:var(--color-warning)">block</span>
            <span class="text-sm font-medium">{{ getSuspendedCount() }} Suspended</span>
          </div>
        </div>
      </div>

      <!-- Search -->
      <div class="glass-card filter-bar">
        <div class="input-icon-wrap" style="max-width:400px">
          <span class="material-icons-round input-icon">search</span>
          <input type="text" class="form-control with-icon" placeholder="Search users by name or email..."
                 (input)="onSearch($event)">
        </div>
        <div class="filter-chips">
          <button class="chip" [class.active]="roleFilter() === ''" (click)="roleFilter.set('')">All</button>
          <button class="chip" [class.active]="roleFilter() === 'Admin'" (click)="roleFilter.set('Admin')">Admins</button>
          <button class="chip" [class.active]="roleFilter() === 'User'" (click)="roleFilter.set('User')">Users</button>
          <button class="chip" [class.active]="statusFilter() === 'suspended'" (click)="toggleSuspendFilter()">Suspended</button>
        </div>
      </div>

      <!-- Table -->
      <div class="glass-card table-card">
        <div *ngIf="loading()" class="p-lg">
          <div class="skeleton" style="height:48px;margin-bottom:8px" *ngFor="let i of [1,2,3,4,5]"></div>
        </div>

        <table class="ss-table" *ngIf="!loading()">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Currency</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let u of filteredUsers()">
              <td>
                <div class="d-flex align-center gap-sm">
                  <div class="avatar avatar-sm" [style.background]="getAvatarGrad(u.role)">{{ u.name.charAt(0).toUpperCase() }}</div>
                  <span class="font-medium">{{ u.name }}</span>
                </div>
              </td>
              <td class="text-muted text-sm">{{ u.email }}</td>
              <td>
                <span class="badge" [class.badge-primary]="u.role === 'Admin'" [class.badge-muted]="u.role !== 'Admin'">{{ u.role }}</span>
              </td>
              <td class="text-sm">{{ u.currency }}</td>
              <td>
                <span class="badge" [class.badge-success]="u.isActive" [class.badge-danger]="!u.isActive">
                  {{ u.isActive ? 'Active' : 'Suspended' }}
                </span>
              </td>
              <td>
                <div class="row-actions-always">
                  <button *ngIf="u.isActive" class="btn btn-secondary btn-sm" (click)="suspend(u)">
                    <span class="material-icons-round" style="font-size:14px">block</span>
                    Suspend
                  </button>
                  <button *ngIf="!u.isActive" class="btn btn-success btn-sm" (click)="activate(u)">
                    <span class="material-icons-round" style="font-size:14px">check_circle</span>
                    Activate
                  </button>
                  <button class="btn btn-icon" style="color:var(--color-danger)" (click)="deleteUser(u)" title="Delete user">
                    <span class="material-icons-round" style="font-size:16px">delete</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="empty-state" *ngIf="filteredUsers().length === 0 && !loading()">
          <span class="empty-state__icon">👥</span>
          <p class="empty-state__title">No users found</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header-row { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: var(--space-xl); flex-wrap: wrap; gap: var(--space-md); }
    .page-title-text { font-size: 24px; font-weight: 700; margin-bottom: 4px; }
    .admin-stats { display: flex; gap: var(--space-sm); }
    .stat-pill-sm { display: flex; align-items: center; gap: 6px; padding: 6px 14px; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-full); }
    .filter-bar { padding: var(--space-md); margin-bottom: var(--space-lg); display: flex; align-items: center; gap: var(--space-md); flex-wrap: wrap; }
    .filter-chips { display: flex; gap: var(--space-sm); flex-wrap: wrap; }
    .table-card { padding: 0; overflow: hidden; }
    .p-lg { padding: var(--space-lg); }
    .row-actions-always { display: flex; align-items: center; gap: 6px; }
  `]
})
export class AdminComponent implements OnInit {
  adminService = inject(AdminService);
  toast        = inject(ToastService);

  users        = signal<User[]>([]);
  loading      = signal(true);
  searchQuery  = signal('');
  roleFilter   = signal('');
  statusFilter = signal('');

  ngOnInit(): void { this.load(); }

  load(): void {
    this.adminService.getUsers().subscribe({
      next: u => { this.users.set(u); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  filteredUsers(): User[] {
    let list = this.users();
    const q = this.searchQuery().toLowerCase();
    if (q) list = list.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    if (this.roleFilter()) list = list.filter(u => u.role === this.roleFilter());
    if (this.statusFilter() === 'suspended') list = list.filter(u => !u.isActive);
    return list;
  }

  toggleSuspendFilter(): void { this.statusFilter.update(v => v === 'suspended' ? '' : 'suspended'); }

  onSearch(e: Event): void { this.searchQuery.set((e.target as HTMLInputElement).value); }

  getSuspendedCount(): number { return this.users().filter(u => !u.isActive).length; }

  suspend(u: User): void {
    if (!confirm(`Suspend ${u.name}?`)) return;
    this.adminService.suspendUser(u.userId).subscribe({ next: () => { this.toast.warning(`${u.name} suspended.`); this.load(); } });
  }

  activate(u: User): void {
    this.adminService.activateUser(u.userId).subscribe({ next: () => { this.toast.success(`${u.name} activated.`); this.load(); } });
  }

  deleteUser(u: User): void {
    if (!confirm(`Permanently delete ${u.name}? This cannot be undone.`)) return;
    this.adminService.deleteUser(u.userId).subscribe({ next: () => { this.toast.success(`${u.name} deleted.`); this.load(); } });
  }

  getAvatarGrad(role: string): string {
    return role === 'Admin' ? 'var(--gradient-warning)' : 'var(--gradient-primary)';
  }
}
