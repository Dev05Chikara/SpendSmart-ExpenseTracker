import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { of, delay } from 'rxjs';
import {
  MOCK_EXPENSES, MOCK_INCOMES, MOCK_INCOME_SUMMARY, MOCK_CATEGORIES,
  MOCK_BUDGETS, MOCK_NOTIFICATIONS, MOCK_MONTHLY_REPORT, MOCK_ADMIN_USERS
} from '../mock/mock-data';

const DEMO_FLAG = 'ss_demo_mode';

export function isDemoMode(): boolean {
  return localStorage.getItem(DEMO_FLAG) === 'true';
}
export function enableDemoMode(): void {
  localStorage.setItem(DEMO_FLAG, 'true');
}
export function disableDemoMode(): void {
  localStorage.removeItem(DEMO_FLAG);
}

export const mockInterceptor: HttpInterceptorFn = (req, next) => {
  if (!isDemoMode()) return next(req);

  const url = req.url;
  const method = req.method;

  // ── Auth ────────────────────────────────────────────────────
  if (url.includes('/auth/profile') && method === 'GET') {
    return mockOk(JSON.parse(localStorage.getItem('ss_user') || '{}'));
  }
  if (url.includes('/auth/update-profile') && method === 'PUT') {
    const body = req.body as any;
    const currentUser = JSON.parse(localStorage.getItem('ss_user') || '{}');
    const user = {
      ...currentUser,
      ...(body.fullName ? { name: body.fullName } : {}),
      ...(body.currency ? { currency: body.currency } : {}),
    };
    localStorage.setItem('ss_user', JSON.stringify(user));
    return mockOk(user);
  }

  // ── Expenses ─────────────────────────────────────────────────
  if (url.includes('/expenses') && method === 'GET' && !url.match(/\/expenses\/[^/]+$/)) {
    return mockOk({ items: MOCK_EXPENSES, totalCount: MOCK_EXPENSES.length, page: 1, pageSize: 20 });
  }
  if (url.includes('/expenses') && method === 'POST') {
    return mockOk({ ...(req.body as any), expenseId: 'exp-new-' + Date.now() });
  }
  if (url.includes('/expenses') && method === 'PUT') {
    return mockOk({ ...(req.body as any) });
  }
  if (url.includes('/expenses') && method === 'DELETE') {
    return mockOk(null);
  }

  // ── Income ──────────────────────────────────────────────────
  if (url.includes('/income/summary')) {
    return mockOk(MOCK_INCOME_SUMMARY);
  }
  if (url.includes('/income') && method === 'GET') {
    return mockOk({ items: MOCK_INCOMES, totalCount: MOCK_INCOMES.length, page: 1, pageSize: 20 });
  }
  if (url.includes('/income') && method === 'POST') {
    return mockOk({ ...(req.body as any), incomeId: 'inc-new-' + Date.now() });
  }
  if (url.includes('/income') && method === 'PUT') {
    return mockOk({ ...(req.body as any) });
  }
  if (url.includes('/income') && method === 'DELETE') {
    return mockOk(null);
  }

  // ── Categories ───────────────────────────────────────────────
  if (url.includes('/categories') && method === 'GET') {
    return mockOk(MOCK_CATEGORIES);
  }
  if (url.includes('/categories') && method === 'POST') {
    return mockOk({ ...(req.body as any), categoryId: 'cat-new-' + Date.now(), isDefault: false, isActive: true });
  }
  if (url.includes('/categories') && method === 'PUT') {
    return mockOk({ ...(req.body as any) });
  }
  if (url.includes('/categories') && method === 'DELETE') {
    return mockOk(null);
  }

  // ── Budgets ──────────────────────────────────────────────────
  if (url.includes('/budgets') && method === 'GET') {
    return mockOk(MOCK_BUDGETS);
  }
  if (url.includes('/budgets') && method === 'POST') {
    return mockOk({ ...(req.body as any), budgetId: 'bud-new-' + Date.now(), spentAmount: 0 });
  }
  if (url.includes('/budgets') && method === 'PUT') {
    return mockOk({ ...(req.body as any) });
  }
  if (url.includes('/budgets') && method === 'DELETE') {
    return mockOk(null);
  }

  // ── Reports ──────────────────────────────────────────────────
  if (url.includes('/reports/monthly')) {
    return mockOk(MOCK_MONTHLY_REPORT);
  }
  if (url.includes('/reports/yearly')) {
    return mockOk({ year: 2026, totalIncome: 85000, totalExpenses: 19000, months: [] });
  }
  if (url.includes('/reports/category-breakdown')) {
    return mockOk(MOCK_MONTHLY_REPORT.expensesByCategory);
  }
  if (url.includes('/reports/export') && method === 'POST') {
    return mockOk({ url: 'https://demo.spendsmart.app/reports/sample-report.pdf' });
  }

  // ── Notifications ─────────────────────────────────────────────
  if (url.includes('/notifications') && method === 'GET') {
    return mockOk(MOCK_NOTIFICATIONS);
  }
  if (url.includes('/notifications') && method === 'PUT') {
    return mockOk(null);
  }
  if (url.includes('/notifications') && method === 'DELETE') {
    return mockOk(null);
  }

  // ── Admin ─────────────────────────────────────────────────────
  if (url.includes('/admin/users') && method === 'GET') {
    return mockOk(MOCK_ADMIN_USERS);
  }
  if (url.includes('/admin/users') && (method === 'PUT' || method === 'DELETE')) {
    return mockOk(null);
  }

  // ── Dashboard / Summary fallback ─────────────────────────────
  if (url.includes('/dashboard/summary')) {
    return mockOk({
      totalBalance: 5517.83, monthlyIncome: 7120.50, monthlyExpenses: 1602.67,
      monthlySavings: 5517.83, budgetAlerts: 2,
      recentExpenses: MOCK_EXPENSES.slice(0, 5),
      topCategories: MOCK_MONTHLY_REPORT.expensesByCategory,
      weeklyTrend: []
    });
  }

  // Fallback — pass through
  return next(req);
};

function mockOk(body: any, latencyMs = 300) {
  return of(new HttpResponse({ status: 200, body })).pipe(delay(latencyMs));
}
