import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Expense, ExpenseFilter, PagedResult } from '../models/models';
import { environment } from '../../../environments/environment';
import { mapExpense, unwrapData } from './backend-response';

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  constructor(private http: HttpClient) {}

  getExpenses(filter: ExpenseFilter = {}): Observable<PagedResult<Expense>> {
    let params = new HttpParams();
    if (filter.startDate)   params = params.set('startDate', filter.startDate);
    if (filter.endDate)     params = params.set('endDate', filter.endDate);
    if (filter.categoryId)  params = params.set('categoryId', filter.categoryId);
    if (filter.paymentMode) params = params.set('paymentMode', filter.paymentMode);
    if (filter.keyword)     params = params.set('keyword', filter.keyword);
    params = params.set('page', filter.page ?? 1);
    params = params.set('pageSize', filter.pageSize ?? 20);
    return this.http.get<any>(`${environment.apiGateway}/expenses`, { params }).pipe(
      map(response => {
        const items = (unwrapData<any[]>(response) ?? []).map(mapExpense);
        return { items, totalCount: items.length, page: filter.page ?? 1, pageSize: filter.pageSize ?? 20 };
      })
    );
  }

  getExpense(id: string): Observable<Expense> {
    return this.http.get<any>(`${environment.apiGateway}/expenses/${id}`).pipe(
      map(response => mapExpense(unwrapData(response)))
    );
  }

  createExpense(expense: Partial<Expense>): Observable<Expense> {
    return this.http.post<any>(`${environment.apiGateway}/expenses`, expense).pipe(
      map(response => mapExpense(unwrapData(response)))
    );
  }

  updateExpense(id: string, expense: Partial<Expense>): Observable<Expense> {
    return this.http.put<any>(`${environment.apiGateway}/expenses/${id}`, expense).pipe(
      map(response => mapExpense(unwrapData(response)))
    );
  }

  deleteExpense(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiGateway}/expenses/${id}`);
  }

  uploadReceipt(id: string, file: File): Observable<{ receiptUrl: string }> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<{ receiptUrl: string }>(`${environment.apiGateway}/expenses/${id}/receipt`, form);
  }
}
