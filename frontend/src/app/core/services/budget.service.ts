import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Budget } from '../models/models';
import { environment } from '../../../environments/environment';
import { mapBudget, unwrapData } from './backend-response';

@Injectable({ providedIn: 'root' })
export class BudgetService {
  constructor(private http: HttpClient) {}

  getBudgets(): Observable<Budget[]> {
    return this.http.get<any>(`${environment.apiGateway}/budgets`).pipe(
      map(response => (unwrapData<any[]>(response) ?? []).map(mapBudget))
    );
  }

  getBudget(id: string): Observable<Budget> {
    return this.http.get<any>(`${environment.apiGateway}/budgets/${id}`).pipe(
      map(response => mapBudget(unwrapData(response)))
    );
  }

  createBudget(budget: Partial<Budget>): Observable<Budget> {
    return this.http.post<any>(`${environment.apiGateway}/budgets`, budget).pipe(
      map(response => mapBudget(unwrapData(response)))
    );
  }

  updateBudget(id: string, budget: Partial<Budget>): Observable<Budget> {
    return this.http.put<any>(`${environment.apiGateway}/budgets/${id}`, budget).pipe(
      map(response => mapBudget(unwrapData(response)))
    );
  }

  deleteBudget(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiGateway}/budgets/${id}`);
  }
}
