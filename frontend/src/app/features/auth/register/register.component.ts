import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-bg">
        <div class="auth-blob blob-1"></div>
        <div class="auth-blob blob-2"></div>
      </div>

      <div class="auth-card glass-card">
        <div class="auth-logo">
          <div class="logo-icon">
            <span class="material-icons-round">account_balance_wallet</span>
          </div>
          <h1 class="auth-brand">SpendSmart</h1>
        </div>

        <div class="auth-header">
          <h2>Create your account</h2>
          <p class="text-muted">Start tracking your finances today</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()" class="auth-form">
          <div class="form-group">
            <label>Full Name</label>
            <div class="input-icon-wrap">
              <span class="material-icons-round input-icon">person_outline</span>
              <input type="text" formControlName="name" class="form-control with-icon"
                     placeholder="John Doe">
            </div>
          </div>

          <div class="form-group">
            <label>Email address</label>
            <div class="input-icon-wrap">
              <span class="material-icons-round input-icon">mail_outline</span>
              <input type="email" formControlName="email" class="form-control with-icon"
                     placeholder="you@example.com">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Password</label>
              <div class="input-icon-wrap">
                <span class="material-icons-round input-icon">lock_outline</span>
                <input [type]="showPass() ? 'text' : 'password'"
                       formControlName="password" class="form-control with-icon"
                       placeholder="Min 8 chars">
                <button type="button" class="input-eye" (click)="toggleShowPass()">
                  <span class="material-icons-round" style="font-size:18px">
                    {{ showPass() ? 'visibility_off' : 'visibility' }}
                  </span>
                </button>
              </div>
            </div>

            <div class="form-group">
              <label>Currency</label>
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
          </div>

          <button type="submit" class="btn btn-primary w-full btn-lg"
                  [disabled]="form.invalid || loading()">
            <span *ngIf="loading()" class="spinner"></span>
            <span>{{ loading() ? 'Creating account...' : 'Create Account' }}</span>
          </button>
        </form>

        <p class="auth-footer">
          <span>Already have an account?</span>
          <a routerLink="/auth/login" class="text-primary-color font-medium">Sign in</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-lg);
      position: relative;
      overflow: hidden;
      background: var(--color-bg);
    }
    .auth-bg { position: fixed; inset: 0; pointer-events: none; }
    .auth-blob {
      position: absolute; border-radius: 50%;
      filter: blur(80px); opacity: 0.12;
    }
    .blob-1 { width: 400px; height: 400px; background: #6C63FF; bottom: -100px; right: -100px; }
    .blob-2 { width: 300px; height: 300px; background: #11D9C5; top: -50px; left: 10%; }

    .auth-card {
      width: 100%; max-width: 460px;
      padding: var(--space-2xl);
      position: relative; z-index: 1;
      animation: slideUp 0.4s ease;
    }

    .auth-logo {
      display: flex; align-items: center; gap: 12px;
      justify-content: center; margin-bottom: var(--space-xl);
    }
    .logo-icon {
      width: 44px; height: 44px; background: var(--gradient-primary);
      border-radius: var(--radius-md);
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 20px rgba(108,99,255,0.4);
      .material-icons-round { font-size: 24px; color: #fff; }
    }
    .auth-brand {
      font-size: 24px; font-weight: 800;
      background: var(--gradient-primary);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }
    .auth-header { text-align: center; margin-bottom: var(--space-xl); h2 { font-size: 22px; font-weight: 700; margin-bottom: 6px; } }
    .auth-form { display: flex; flex-direction: column; gap: var(--space-md); }
    .auth-form .btn {
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      width: 100%;
    }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md); }
    .input-icon-wrap { position: relative; }
    .input-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-size: 18px; color: var(--text-muted); pointer-events: none; }
    .with-icon { padding-left: 42px; }
    .input-eye { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); color: var(--text-muted); cursor: pointer; padding: 4px; background: none; border: none; &:hover { color: var(--text-primary); } }
    .spinner { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }
    .auth-footer {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      flex-wrap: wrap;
      text-align: center;
      font-size: 14px;
      color: var(--text-secondary);
      margin-top: var(--space-lg);
    }
    @media (max-width: 480px) { .form-row { grid-template-columns: 1fr; } }
  `]
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private toast       = inject(ToastService);
  private router      = inject(Router);
  private fb          = inject(FormBuilder);

  loading  = signal(false);
  showPass = signal(false);

  form = this.fb.group({
    name:     ['', [Validators.required, Validators.minLength(2)]],
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    currency: ['USD', Validators.required]
  });

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.authService.register({
      fullName: this.form.value.name as string,
      email: this.form.value.email as string,
      password: this.form.value.password as string,
      currency: this.form.value.currency as string,
    }).subscribe({
      next: () => {
        const credentials = {
          email: this.form.value.email as string,
          password: this.form.value.password as string,
        };

        this.authService.login(credentials).subscribe({
          next: () => {
            this.toast.success('Account created successfully!');
            this.router.navigate(['/dashboard']);
          },
          error: (err) => {
            this.toast.error(err.message || 'Registration succeeded, but sign-in failed');
            this.loading.set(false);
          }
        });
      },
      error: (err) => {
        this.toast.error(err.message || 'Registration failed');
        this.loading.set(false);
      }
    });
  }

  toggleShowPass(): void { this.showPass.update(v => !v); }
}
