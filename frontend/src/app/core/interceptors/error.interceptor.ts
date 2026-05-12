import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { ToastService } from '../services/toast.service';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router  = inject(Router);
  const toast   = inject(ToastService);
  const auth    = inject(AuthService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        auth.logout();
        toast.error('Session expired. Please login again.');
      } else if (err.status === 403) {
        toast.error('You are not authorized to perform this action.');
        router.navigate(['/dashboard']);
      } else if (err.status === 0) {
        toast.error('Network error. Please check your connection.');
      } else if (err.status >= 500) {
        toast.error('Server error. Please try again later.');
      } else if (err.error?.message) {
        toast.error(err.error.message);
      }
      return throwError(() => err);
    })
  );
};
