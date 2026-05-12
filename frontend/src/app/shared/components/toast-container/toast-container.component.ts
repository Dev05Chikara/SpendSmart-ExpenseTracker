import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div *ngFor="let t of toastService.toasts()"
           class="toast"
           [class]="'toast-' + t.type">
        <span class="material-icons-round toast-icon">{{ getIcon(t.type) }}</span>
        <span class="flex-1">{{ t.message }}</span>
        <button class="btn btn-icon" style="padding:2px" (click)="toastService.remove(t.id)">
          <span class="material-icons-round" style="font-size:16px">close</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .flex-1 { flex: 1; }
    .toast-icon { font-size: 18px; }
  `]
})
export class ToastContainerComponent {
  toastService = inject(ToastService);

  getIcon(type: Toast['type']): string {
    const icons: Record<Toast['type'], string> = {
      success: 'check_circle',
      error: 'error',
      warning: 'warning',
      info: 'info'
    };
    return icons[type];
  }
}
