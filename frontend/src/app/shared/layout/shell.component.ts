import { Component, signal, HostListener, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { NotificationBellComponent } from '../components/notification-bell/notification-bell.component';
import { isDemoMode } from '../../core/interceptors/mock.interceptor';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  badge?: number;
  adminOnly?: boolean;
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, NotificationBellComponent],
  template: `
    <div class="shell" [class.sidebar-collapsed]="sidebarCollapsed()">

      <!-- ── Sidebar ─────────────────────────────────────────── -->
      <aside class="sidebar" [class.open]="mobileSidebarOpen()">
        <div class="sidebar__header">
          <div class="sidebar__logo">
            <div class="logo-icon">
              <span class="material-icons-round">account_balance_wallet</span>
            </div>
            <span class="logo-text">SpendSmart</span>
          </div>
          <button class="btn btn-icon collapse-btn hide-mobile"
                  (click)="toggleSidebar()"
                  title="Toggle sidebar">
            <span class="material-icons-round">
              {{ sidebarCollapsed() ? 'menu_open' : 'menu' }}
            </span>
          </button>
        </div>

        <nav class="sidebar__nav">
          <div class="nav-section" *ngFor="let section of navSections">
            <span class="nav-section__label" *ngIf="!sidebarCollapsed()">{{ section.label }}</span>
            <ng-container *ngFor="let item of section.items">
              <a *ngIf="!item.adminOnly || authService.isAdmin()"
                 [routerLink]="item.route"
                 routerLinkActive="active"
                 class="nav-item"
                 [title]="item.label"
                 (click)="closeMobileSidebar()">
                <span class="material-icons-round nav-item__icon">{{ item.icon }}</span>
                <span class="nav-item__label">{{ item.label }}</span>
                <span class="badge badge-primary nav-item__badge" *ngIf="$any(item).badge">{{ $any(item).badge }}</span>
              </a>
            </ng-container>
          </div>
        </nav>

        <div class="sidebar__footer">
          <div class="user-card" *ngIf="authService.currentUser() as user">
            <div class="avatar avatar-sm" [style.background]="'var(--gradient-primary)'">
              {{ user.name.charAt(0).toUpperCase() }}
            </div>
            <div class="user-info" *ngIf="!sidebarCollapsed()">
              <span class="user-name">{{ user.name }}</span>
              <span class="user-role badge" [class.badge-primary]="user.role === 'Admin'" [class.badge-muted]="user.role !== 'Admin'">
                {{ user.role }}
              </span>
            </div>
          </div>
          <button class="btn btn-ghost btn-sm logout-btn" (click)="logout()" title="Logout">
            <span class="material-icons-round">logout</span>
            <span *ngIf="!sidebarCollapsed()">Logout</span>
          </button>
        </div>
      </aside>

      <!-- Mobile overlay -->
      <div class="mobile-overlay"
           *ngIf="mobileSidebarOpen()"
           (click)="closeMobileSidebar()"></div>

      <!-- ── Main ───────────────────────────────────────────── -->
      <main class="main">

        <!-- Topbar -->
        <header class="topbar">
          <button class="btn btn-icon hide-desktop" (click)="mobileSidebarOpen.set(true)">
            <span class="material-icons-round">menu</span>
          </button>

          <div class="topbar__breadcrumb">
            <span class="page-title">{{ getPageTitle() }}</span>
            <span class="demo-badge" *ngIf="isDemoMode()">
              <span class="demo-dot"></span>
              Demo Mode
            </span>
          </div>

          <div class="topbar__actions">
            <app-notification-bell />

            <div class="topbar__currency" *ngIf="authService.currentUser() as user">
              <span class="material-icons-round" style="font-size:16px;color:var(--color-primary-light)">currency_exchange</span>
              <span class="text-sm font-medium">{{ user.currency || 'USD' }}</span>
            </div>

            <a routerLink="/profile" class="topbar__user" *ngIf="authService.currentUser() as user">
              <div class="avatar avatar-sm">{{ user.name.charAt(0).toUpperCase() }}</div>
            </a>
          </div>
        </header>

        <!-- Page content -->
        <div class="content">
          <router-outlet />
        </div>
      </main>
    </div>
  `,
  styles: [`
    .shell {
      display: flex;
      height: 100vh;
      overflow: hidden;
    }

    // ── Sidebar ───────────────────────────────────────────────
    .sidebar {
      width: var(--sidebar-width);
      height: 100vh;
      background: rgba(255,255,255,0.025);
      border-right: 1px solid var(--color-border);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      transition: width var(--transition-base);
      overflow: hidden;
      position: relative;
      z-index: 100;
      backdrop-filter: blur(20px);
    }

    .sidebar-collapsed .sidebar { width: var(--sidebar-collapsed); }

    .sidebar__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 16px;
      border-bottom: 1px solid var(--color-border);
      height: var(--topbar-height);
      flex-shrink: 0;
    }

    .sidebar__logo {
      display: flex;
      align-items: center;
      gap: 10px;
      overflow: hidden;
    }

    .logo-icon {
      width: 36px;
      height: 36px;
      background: var(--gradient-primary);
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 4px 15px rgba(108,99,255,0.4);

      .material-icons-round { font-size: 20px; color: #fff; }
    }

    .logo-text {
      font-size: 18px;
      font-weight: 800;
      background: var(--gradient-primary);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      white-space: nowrap;
    }

    .sidebar-collapsed .logo-text,
    .sidebar-collapsed .nav-item__label,
    .sidebar-collapsed .nav-section__label,
    .sidebar-collapsed .user-info,
    .sidebar-collapsed .logout-btn span:last-child { display: none; }

    .collapse-btn { color: var(--text-muted); }

    .sidebar__nav {
      flex: 1;
      overflow-y: auto;
      padding: 12px 8px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .nav-section { margin-bottom: 8px; }

    .nav-section__label {
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 1px;
      text-transform: uppercase;
      color: var(--text-muted);
      padding: 8px 12px 4px;
      display: block;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      border-radius: var(--radius-md);
      color: var(--text-secondary);
      font-size: 14px;
      font-weight: 500;
      transition: all var(--transition-fast);
      white-space: nowrap;
      position: relative;

      &:hover {
        background: var(--color-surface-hover);
        color: var(--text-primary);
      }

      &.active {
        background: rgba(108,99,255,0.15);
        color: var(--color-primary-light);
        border: 1px solid rgba(108,99,255,0.25);

        .nav-item__icon { color: var(--color-primary-light); }
      }
    }

    .nav-item__icon { font-size: 20px; flex-shrink: 0; }
    .nav-item__badge { margin-left: auto; font-size: 10px; padding: 2px 6px; }

    .sidebar-collapsed .nav-item { justify-content: center; padding: 10px; }
    .sidebar-collapsed .nav-item__badge { position: absolute; top: 6px; right: 6px; }

    .sidebar__footer {
      padding: 12px 8px;
      border-top: 1px solid var(--color-border);
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .user-card {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px;
      border-radius: var(--radius-md);
    }

    .user-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
      overflow: hidden;
    }

    .user-name {
      font-size: 13px;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .logout-btn {
      justify-content: flex-start;
      width: 100%;
      padding: 8px 12px;
    }

    .sidebar-collapsed .logout-btn { justify-content: center; }
    .sidebar-collapsed .user-card  { justify-content: center; }

    // ── Mobile ────────────────────────────────────────────────
    @media (max-width: 768px) {
      .sidebar {
        position: fixed;
        left: -100%;
        top: 0;
        height: 100%;
        z-index: 300;
        width: var(--sidebar-width) !important;
        transition: left var(--transition-base);
        box-shadow: var(--shadow-lg);

        .logo-text, .nav-item__label, .nav-section__label,
        .user-info, .logout-btn span:last-child { display: flex !important; }

        .nav-item { justify-content: flex-start !important; padding: 10px 12px !important; }
        .user-card { justify-content: flex-start !important; }
        .logout-btn { justify-content: flex-start !important; }
      }

      .sidebar.open { left: 0; }

      .mobile-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.5);
        z-index: 299;
        backdrop-filter: blur(2px);
      }
    }

    // ── Main ──────────────────────────────────────────────────
    .main {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .topbar {
      height: var(--topbar-height);
      border-bottom: 1px solid var(--color-border);
      display: flex;
      align-items: center;
      gap: var(--space-md);
      padding: 0 var(--space-lg);
      background: rgba(255,255,255,0.02);
      backdrop-filter: blur(12px);
      flex-shrink: 0;
      position: relative;
      z-index: 200;
      overflow: visible;
    }

    .topbar__breadcrumb { flex: 1; }

    .page-title {
      font-size: 18px;
      font-weight: 700;
    }

    .demo-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 3px 10px;
      background: linear-gradient(135deg, rgba(17,217,197,0.15), rgba(79,172,254,0.15));
      border: 1px solid rgba(17,217,197,0.35);
      border-radius: 999px;
      font-size: 11px;
      font-weight: 600;
      color: #11D9C5;
      margin-left: 12px;
      vertical-align: middle;
    }

    .demo-dot {
      width: 7px; height: 7px;
      background: #11D9C5;
      border-radius: 50%;
      animation: pulse 1.5s ease-in-out infinite;
      box-shadow: 0 0 6px rgba(17,217,197,0.8);
    }

    .topbar__actions {
      display: flex;
      align-items: center;
      gap: var(--space-md);
      position: relative;
      z-index: 201;
    }

    .topbar__currency {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 6px 12px;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-full);
    }

    .topbar__user {
      cursor: pointer;
      border-radius: var(--radius-full);
      border: 2px solid var(--color-border);
      transition: border-color var(--transition-fast);
      &:hover { border-color: var(--color-primary); }
    }

    .content {
      flex: 1;
      overflow-y: auto;
      padding: var(--space-xl);
      background: var(--color-bg);

      @media (max-width: 768px) { padding: var(--space-md); }
    }
  `]
})
export class ShellComponent implements OnInit, OnDestroy {
  authService   = inject(AuthService);
  notifService  = inject(NotificationService);

  sidebarCollapsed  = signal(false);
  mobileSidebarOpen = signal(false);

  navSections = [
    {
      label: 'Overview',
      items: [
        { label: 'Dashboard',     icon: 'dashboard',       route: '/dashboard' },
      ]
    },
    {
      label: 'Finance',
      items: [
        { label: 'Expenses',      icon: 'receipt_long',    route: '/expenses' },
        { label: 'Income',        icon: 'trending_up',     route: '/income' },
        { label: 'Budgets',       icon: 'savings',         route: '/budgets' },
        { label: 'Categories',    icon: 'category',        route: '/categories' },
      ]
    },
    {
      label: 'Insights',
      items: [
        { label: 'Reports',       icon: 'bar_chart',       route: '/reports' },
        { label: 'Notifications', icon: 'notifications',   route: '/notifications' },
      ]
    },
    {
      label: 'Account',
      items: [
        { label: 'Profile',       icon: 'person',          route: '/profile' },
        { label: 'Admin Panel',   icon: 'admin_panel_settings', route: '/admin', adminOnly: true },
      ]
    }
  ];

  ngOnInit(): void {
    this.notifService.getNotifications().subscribe();
    this.notifService.startSignalR();
  }

  ngOnDestroy(): void {
    this.notifService.stopSignalR();
  }

  toggleSidebar(): void {
    this.sidebarCollapsed.update(v => !v);
  }

  closeMobileSidebar(): void {
    this.mobileSidebarOpen.set(false);
  }

  logout(): void {
    this.authService.logout();
  }

  getPageTitle(): string {
    const path = window.location.pathname.split('/')[1] || 'dashboard';
    const titles: Record<string, string> = {
      dashboard: 'Dashboard',
      expenses: 'Expenses',
      income: 'Income',
      budgets: 'Budgets',
      categories: 'Categories',
      reports: 'Reports',
      notifications: 'Notifications',
      profile: 'My Profile',
      admin: 'Admin Panel'
    };
    return titles[path] ?? 'SpendSmart';
  }

  isDemoMode(): boolean { return isDemoMode(); }
}
