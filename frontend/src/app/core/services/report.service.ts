import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { MonthlyReport, YearlyReport, CategoryBreakdown, Notification } from '../models/models';
import { environment } from '../../../environments/environment';
import { unwrapData } from './backend-response';

@Injectable({ providedIn: 'root' })
export class ReportService {
  constructor(private http: HttpClient) {}

  getMonthlyReport(year: number, month: number): Observable<MonthlyReport> {
    return this.http.get<any>(`${environment.apiGateway}/reports/monthly/${year}/${month}`).pipe(
      map(response => {
        const payload = unwrapData<any>(response);
        return {
          year: payload?.year ?? year,
          month: payload?.month ?? month,
          totalIncome: Number(payload?.totalIncome ?? payload?.TotalIncome ?? 0),
          totalExpenses: Number(payload?.totalExpense ?? payload?.TotalExpense ?? 0),
          netSavings: Number(payload?.netSavings ?? payload?.NetSavings ?? 0),
          expensesByCategory: (payload?.details ?? payload?.Details ?? [])
            .filter((item: any) => (item.type ?? item.Type) === 'Expense')
            .map((item: any, index: number) => ({
              categoryName: item.category ?? item.Category ?? `Category ${index + 1}`,
              categoryColor: ['#6C63FF', '#FF6B8A', '#11D9C5', '#FFB347', '#4FACFE'][index % 5],
              amount: Number(item.amount ?? item.Amount ?? 0),
              percentage: payload?.totalExpense ? Math.round((Number(item.amount ?? item.Amount ?? 0) / Number(payload.totalExpense ?? payload.TotalExpense)) * 100) : 0,
            })),
          dailyExpenses: (payload?.dailyExpenses ?? payload?.DailyExpenses ?? []).map((item: any) => ({
            date: item.date ?? item.Date,
            amount: Number(item.amount ?? item.Amount ?? 0),
          })),
        } as MonthlyReport;
      })
    );
  }

  getYearlyReport(year: number): Observable<YearlyReport> {
    return this.http.get<any>(`${environment.apiGateway}/reports/yearly/${year}`).pipe(
      map(response => {
        const payload = unwrapData<any>(response);
        return {
          year: payload?.year ?? year,
          months: (payload?.monthlyBreakdown ?? payload?.MonthlyBreakdown ?? []).map((item: any) => ({
            month: item.month ?? item.Month,
            income: Number(item.income ?? item.Income ?? 0),
            expenses: Number(item.expense ?? item.Expense ?? 0),
          })),
          totalIncome: Number(payload?.totalIncome ?? payload?.TotalIncome ?? 0),
          totalExpenses: Number(payload?.totalExpense ?? payload?.TotalExpense ?? 0),
        } as YearlyReport;
      })
    );
  }

  getCategoryBreakdown(): Observable<CategoryBreakdown[]> {
    const today = new Date();
    return this.http.get<any>(`${environment.apiGateway}/reports/category-breakdown/${today.getFullYear()}/${today.getMonth() + 1}`).pipe(
      map(response => {
        const payload = unwrapData<any>(response);
        return (payload?.categories ?? payload?.Categories ?? []).map((item: any) => ({
          categoryName: item.categoryName ?? item.CategoryName,
          categoryColor: '#6C63FF',
          amount: Number(item.amount ?? item.Amount ?? 0),
          percentage: Number(item.percentage ?? item.Percentage ?? 0),
        })) as CategoryBreakdown[];
      })
    );
  }

  exportReport(year: number, month: number): Observable<{ url: string }> {
    return this.http.post<any>(`${environment.apiGateway}/reports/export`, { year, month }).pipe(
      map(response => ({ url: response?.url ?? response?.Url ?? '#' }))
    );
  }
}
