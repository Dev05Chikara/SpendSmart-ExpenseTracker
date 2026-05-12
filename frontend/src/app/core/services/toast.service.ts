import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts = signal<Toast[]>([]);

  show(type: Toast['type'], message: string, duration = 4000): void {
    const id = Math.random().toString(36).slice(2);
    const toast: Toast = { id, type, message, duration };
    this.toasts.update(list => [...list, toast]);
    if (duration > 0) setTimeout(() => this.remove(id), duration);
  }

  success(msg: string) { this.show('success', msg); }
  error(msg: string)   { this.show('error', msg); }
  warning(msg: string) { this.show('warning', msg); }
  info(msg: string)    { this.show('info', msg); }

  remove(id: string): void {
    this.toasts.update(list => list.filter(t => t.id !== id));
  }
}
