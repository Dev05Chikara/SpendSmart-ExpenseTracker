import { Component, inject, signal, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';

declare const google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-bg">
        <div class="auth-blob blob-1"></div>
        <div class="auth-blob blob-2"></div>
        <div class="auth-blob blob-3"></div>
      </div>

      <div class="auth-card glass-card">
        <!-- Logo -->
        <div class="auth-logo">
          <div class="logo-icon">
            <span class="material-icons-round">account_balance_wallet</span>
          </div>
          <h1 class="auth-brand">SpendSmart</h1>
        </div>

        <div class="auth-header">
          <h2>Welcome back</h2>
          <p class="text-muted">Sign in to your account to continue</p>
        </div>

        <!-- ── Demo Banner ─────────────────────────────── -->
        <div class="demo-banner">
          <div class="demo-banner__left">
            <div class="demo-pulse"></div>
            <div>
              <p class="demo-title">No account? Try the demo</p>
              <p class="demo-sub">Explore all features with realistic sample data</p>
            </div>
          </div>
          <button class="btn demo-btn" (click)="tryDemo()">
            <span class="material-icons-round" style="font-size:18px">rocket_launch</span>
            Live Demo
          </button>
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()" class="auth-form">
          <div class="form-group">
            <label>Email address</label>
            <div class="input-icon-wrap">
              <span class="material-icons-round input-icon">mail_outline</span>
              <input type="email" formControlName="email" class="form-control with-icon"
                     placeholder="you@example.com" autocomplete="email">
            </div>
          </div>

          <div class="form-group">
            <label>
              Password
            </label>
            <div class="input-icon-wrap">
              <span class="material-icons-round input-icon">lock_outline</span>
              <input [type]="showPass() ? 'text' : 'password'"
                     formControlName="password" class="form-control with-icon"
                     placeholder="••••••••" autocomplete="current-password">
              <button type="button" class="input-eye" (click)="toggleShowPass()">
                <span class="material-icons-round" style="font-size:18px">
                  {{ showPass() ? 'visibility_off' : 'visibility' }}
                </span>
              </button>
            </div>
          </div>

          <button type="submit" class="btn btn-primary w-full btn-lg"
                  [disabled]="form.invalid || loading()">
            <span *ngIf="loading()" class="spinner"></span>
            <span *ngIf="!loading()">Sign In</span>
            <span *ngIf="loading()">Signing in...</span>
          </button>
        </form>

        <div class="auth-divider">
          <span>or continue with</span>
        </div>

        <!-- Visible Google Button Container -->
        <div id="google-signin-button" style="display: flex; justify-content: center;"></div>

        <!-- Custom Button Overlay (click handler) -->
        <button type="button" class="btn btn-secondary w-full google-btn" (click)="googleLogin()" 
                *ngIf="!googleButtonReady()">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <p class="auth-footer">
          <span>Don't have an account?</span>
          <a routerLink="/auth/register" class="text-primary-color font-medium">Create one</a>
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
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.12;
      animation: blobFloat 8s ease-in-out infinite;
    }
    .blob-1 { width: 400px; height: 400px; background: #6C63FF; top: -100px; left: -100px; }
    .blob-2 { width: 300px; height: 300px; background: #9B59FF; bottom: -50px; right: 10%; animation-delay: -3s; }
    .blob-3 { width: 250px; height: 250px; background: #4FACFE; top: 40%; right: -80px; animation-delay: -6s; }

    @keyframes blobFloat {
      0%, 100% { transform: translate(0, 0) scale(1); }
      50% { transform: translate(20px, -20px) scale(1.05); }
    }

    .auth-card {
      width: 100%;
      max-width: 420px;
      padding: var(--space-2xl);
      position: relative;
      z-index: 1;
      animation: slideUp 0.4s ease;
    }

    .auth-logo {
      display: flex;
      align-items: center;
      gap: 12px;
      justify-content: center;
      margin-bottom: var(--space-xl);
    }

    .logo-icon {
      width: 44px; height: 44px;
      background: var(--gradient-primary);
      border-radius: var(--radius-md);
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 20px rgba(108,99,255,0.4);
      .material-icons-round { font-size: 24px; color: #fff; }
    }

    .auth-brand {
      font-size: 24px;
      font-weight: 800;
      background: var(--gradient-primary);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .auth-header {
      text-align: center;
      margin-bottom: var(--space-xl);

      h2 { font-size: 22px; font-weight: 700; margin-bottom: 6px; }
    }

    .auth-form { display: flex; flex-direction: column; gap: var(--space-md); }
    .auth-form .btn {
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      width: 100%;
    }

    .input-icon-wrap { position: relative; }

    .input-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 18px;
      color: var(--text-muted);
      pointer-events: none;
    }

    .with-icon { padding-left: 42px; }

    .input-eye {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-muted);
      cursor: pointer;
      padding: 4px;
      background: none;
      border: none;
      transition: color var(--transition-fast);
      &:hover { color: var(--text-primary); }
    }

    .spinner {
      width: 18px; height: 18px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }

    .auth-divider {
      display: flex;
      align-items: center;
      gap: var(--space-md);
      margin: var(--space-lg) 0;

      &::before, &::after {
        content: '';
        flex: 1;
        height: 1px;
        background: var(--color-border);
      }

      span { font-size: 12px; color: var(--text-muted); white-space: nowrap; }
    }

    .google-btn {
      gap: 10px;
      justify-content: center;
      align-items: center;
      font-size: 14px;
      margin: 0 auto;
      width: fit-content;
      min-width: 200px;
      padding-left: 18px;
      padding-right: 18px;
    }

    #google-signin-button {
      display: flex !important;
      justify-content: center;
      margin-bottom: var(--space-md);
      width: 100%;
    }

    #google-signin-button > div,
    #google-signin-button iframe {
      width: auto !important;
      min-width: 200px !important;
    }

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
    .demo-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 14px 16px;
      background: linear-gradient(135deg, rgba(17,217,197,0.12), rgba(79,172,254,0.12));
      border: 1px solid rgba(17,217,197,0.3);
      border-radius: var(--radius-md);
      margin-bottom: var(--space-lg);
      animation: pulse-border 2.5s ease-in-out infinite;
    }

    @keyframes pulse-border {
      0%, 100% { border-color: rgba(17,217,197,0.3); box-shadow: none; }
      50%       { border-color: rgba(17,217,197,0.7); box-shadow: 0 0 20px rgba(17,217,197,0.15); }
    }

    .demo-banner__left {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
    }

    .demo-pulse {
      width: 10px; height: 10px;
      background: var(--color-success);
      border-radius: 50%;
      flex-shrink: 0;
      animation: pulse 1.5s ease-in-out infinite;
      box-shadow: 0 0 10px rgba(17,217,197,0.6);
    }

    .demo-title { font-size: 13px; font-weight: 600; color: var(--color-success); margin-bottom: 2px; }
    .demo-sub   { font-size: 11px; color: var(--text-muted); }

    .demo-btn {
      background: linear-gradient(135deg, #11D9C5, #4FACFE);
      color: #000;
      font-weight: 700;
      font-size: 13px;
      padding: 8px 16px;
      border-radius: var(--radius-md);
      white-space: nowrap;
      flex-shrink: 0;
      transition: all var(--transition-base);
      box-shadow: 0 4px 15px rgba(17,217,197,0.35);
      &:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(17,217,197,0.5); }
    }

    #google-signin-button {
      display: flex !important;
      justify-content: center;
      margin-bottom: var(--space-md);
    }

    #google-signin-button div {
      width: 100% !important;
    }

    #google-signin-button button {
      width: 100% !important;
      height: 40px !important;
      font-size: 14px !important;
    }
  `]
})
export class LoginComponent implements OnInit, AfterViewInit {
  private authService = inject(AuthService);
  private toast       = inject(ToastService);
  private router      = inject(Router);
  private fb          = inject(FormBuilder);

  loading  = signal(false);
  showPass = signal(false);
  googleButtonReady = signal(false);

  form = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  ngOnInit(): void {
    // Check if google is available
    if (typeof google === 'undefined') {
      console.error('Google Sign-In library not loaded');
    }
  }

  ngAfterViewInit(): void {
    // Initialize Google Sign-In
    if (typeof google !== 'undefined') {
      setTimeout(() => {
        try {
          google.accounts.id.initialize({
            client_id: environment.googleClientId,
            callback: (response: any) => this.handleGoogleCallback(response)
          });
          
          // Render button to the container
          const container = document.getElementById('google-signin-button');
          if (container) {
            google.accounts.id.renderButton(container, {
              type: 'standard',
              size: 'large',
              theme: 'filled_black',
              text: 'signin_with',
              shape: 'pill',
              logo_alignment: 'center',
              width: 200
            });
            this.googleButtonReady.set(true);
            console.log('Google button rendered');
          } else {
            console.error('Container not found');
          }
        } catch (error) {
          console.error('Error initializing Google Sign-In:', error);
        }
      }, 100);
    }
  }

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.authService.login(this.form.value as any).subscribe({
      next: () => {
        this.toast.success('Welcome back!');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.toast.error(err.message || 'Login failed');
        this.loading.set(false);
      }
    });
  }

  tryDemo(): void {
    this.authService.demoLogin();
  }

  toggleShowPass(): void { this.showPass.update(v => !v); }

  googleLogin(): void {
    try {
      // Click the rendered Google button
      const googleButton = document.querySelector('#google-signin-button button');
      if (googleButton) {
        (googleButton as HTMLButtonElement).click();
        console.log('Clicked Google button');
      } else {
        // Fallback - try to trigger via keyboard
        const event = new KeyboardEvent('keydown', { key: 'Enter' });
        const container = document.getElementById('google-signin-button');
        if (container) {
          container.dispatchEvent(event);
        }
        console.error('Google button not found, tried keyboard event');
      }
    } catch (error) {
      console.error('Google login error:', error);
      this.toast.error('Failed to initiate Google login');
    }
  }

  private handleGoogleCallback(response: any): void {
    if (!response || !response.credential) {
      console.error('No credential in response', response);
      this.toast.error('Google authentication failed');
      return;
    }

    this.loading.set(true);

    // Send the ID token to backend
    console.log('Sending ID token to backend');
    this.authService.googleOAuth(response.credential).subscribe({
      next: () => {
        this.toast.success('Welcome! Signed in with Google');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Backend auth error:', err);
        this.toast.error(err.message || 'Google login failed');
        this.loading.set(false);
      }
    });
  }
}
