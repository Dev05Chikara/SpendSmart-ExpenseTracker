import { Routes } from '@angular/router';

export const INCOME_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./income-list/income-list.component').then(m => m.IncomeListComponent) },
];
