import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';
import { Income, IncomeSummary, PagedResult } from '../models/models';
import { environment } from '../../../environments/environment';
import { mapExpense, mapIncome, unwrapData } from './backend-response';

@Injectable({ providedIn: 'root' })
export class IncomeService {
  constructor(private http: HttpClient) {}

  getIncomes(page = 1, pageSize = 20): Observable<PagedResult<Income>> {
    return this.http.get<any>(`${environment.apiGateway}/incomes?page=${page}&pageSize=${pageSize}`).pipe(
      map(response => {
        const items = (unwrapData<any[]>(response) ?? []).map(mapIncome);
        return { items, totalCount: items.length, page, pageSize };
      })
    );
  }

  getIncome(id: string): Observable<Income> {
    return this.http.get<any>(`${environment.apiGateway}/incomes/${id}`).pipe(
      map(response => mapIncome(unwrapData(response)))
    );
  }

  createIncome(income: Partial<Income>): Observable<Income> {
    return this.http.post<any>(`${environment.apiGateway}/incomes`, income).pipe(
      map(response => mapIncome(unwrapData(response)))
    );
  }

  updateIncome(id: string, income: Partial<Income>): Observable<Income> {
    return this.http.put<any>(`${environment.apiGateway}/incomes/${id}`, income).pipe(
      map(response => mapIncome(unwrapData(response)))
    );
  }

  deleteIncome(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiGateway}/incomes/${id}`);
  }

  getSummary(): Observable<IncomeSummary> {
    return forkJoin({
      incomes: this.getIncomes(),
      expenses: this.http.get<any>(`${environment.apiGateway}/expenses`).pipe(
        map(response => (unwrapData<any[]>(response) ?? []).map(mapExpense))
      ),
    }).pipe(
      map(({ incomes, expenses }) => {
        const totalIncome = incomes.items.reduce((sum, item) => sum + item.amount, 0);
        const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
        return {
          totalIncome,
          totalExpenses,
          netBalance: totalIncome - totalExpenses,
          bySource: incomes.items.reduce<Array<{ source: string; amount: number }>>((acc, item) => {
            const existing = acc.find(entry => entry.source === item.source);
            if (existing) {
              existing.amount += item.amount;
            } else {
              acc.push({ source: item.source, amount: item.amount });
            }
            return acc;
          }, []),
        };
      })
    );
  }
}
