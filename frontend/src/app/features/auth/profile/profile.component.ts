import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page-enter">
      <div class="page-header">
        <h2 class="page-title-text">My Profile</h2>
        <p class="text-muted text-sm">Manage your account settings and preferences</p>
      </div>

      <div class="profile-grid">
        <!-- Avatar Card -->
        <div class="glass-card avatar-card">
          <div class="avatar avatar-xl">{{ (authService.currentUser()?.name || 'U').charAt(0).toUpperCase() }}</div>
          <div class="text-center">
            <h3 style="font-size:18px;font-weight:700">{{ authService.currentUser()?.name }}</h3>
            <p class="text-muted text-sm">{{ authService.currentUser()?.email }}</p>
            <span class="badge mt-sm" [class.badge-primary]="authService.currentUser()?.role === 'Admin'" [class.badge-muted]="authService.currentUser()?.role !== 'Admin'">
              {{ authService.currentUser()?.role }}
            </span>
          </div>
          <div class="avatar-stats">
            <div class="stat-pill">
              <span class="material-icons-round" style="font-size:16px;color:var(--color-primary-light)">attach_money</span>
              <span class="text-sm font-medium">{{ authService.currentUser()?.currency }}</span>
            </div>
          </div>
        </div>

        <!-- Edit Form -->
        <div class="glass-card profile-form-card">
          <h3 class="section-title">Personal Information</h3>
          <form [formGroup]="form" (ngSubmit)="save()" class="profile-form">
            <div class="form-group">
              <label>Full Name</label>
              <input type="text" formControlName="name" class="form-control" placeholder="Your name">
            </div>
            <div class="form-group">
              <label>Email</label>
              <input type="email" formControlName="email" class="form-control" [attr.disabled]="true">
            </div>
            <div class="form-group">
              <label>Preferred Currency</label>
              <div class="input-icon-wrap">
                <span class="material-icons-round input-icon">attach_money</span>
                <select formControlName="currency" class="form-control with-icon">
                  <option value="USD">USD – Dollar</option>
                  <option value="EUR">EUR – Euro</option>
                  <option value="GBP">GBP – Pound</option>
                  <option value="INR">INR – Rupee</option>
                  <option value="JPY">JPY – Yen</option>
                  <option value="AUD">AUD – Dollar</option>
                </select>
              </div>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" [disabled]="form.invalid || saving()">
                <span *ngIf="saving()" class="spinner-sm"></span>
                {{ saving() ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header { margin-bottom: var(--space-xl); }
    .page-title-text { font-size: 24px; font-weight: 700; margin-bottom: 4px; }

    .profile-grid {
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: var(--space-xl);
      @media (max-width: 768px) { grid-template-columns: 1fr; }
    }

    .avatar-card {
      padding: var(--space-xl);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-md);
    }

    .avatar-xl {
      width: 96px; height: 96px; font-size: 36px;
      box-shadow: 0 8px 32px rgba(108,99,255,0.3);
    }

    .avatar-stats {
      display: flex; gap: var(--space-sm);
    }

    .stat-pill {
      display: flex; align-items: center; gap: 6px;
      padding: 6px 14px;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-full);
    }

    .profile-form-card { padding: var(--space-xl); }
    .section-title { font-size: 16px; font-weight: 700; margin-bottom: var(--space-lg); }
    .profile-form { display: flex; flex-direction: column; gap: var(--space-md); }
    .form-actions { display: flex; justify-content: flex-end; margin-top: var(--space-sm); }
    .spinner-sm { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }
  `]
})
export class ProfileComponent implements OnInit {
  authService = inject(AuthService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  saving = signal(false);

  form = this.fb.group({
    name:  ['', Validators.required],
    email: [{ value: '', disabled: true }],
    currency: ['USD', Validators.required]
  });

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user) {
      this.form.patchValue({ name: user.name, email: user.email, currency: user.currency ?? 'USD' });
    }
  }

  save(): void {
    this.saving.set(true);
    this.authService.updateProfile(this.form.value as any).subscribe({
      next: () => { this.toast.success('Profile updated!'); this.saving.set(false); },
      error: () => { this.saving.set(false); }
    });
  }
}
