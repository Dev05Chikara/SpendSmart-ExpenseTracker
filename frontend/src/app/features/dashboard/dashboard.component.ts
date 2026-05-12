import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ExpenseService } from '../../core/services/expense.service';
import { BudgetService } from '../../core/services/budget.service';
import { IncomeService } from '../../core/services/income.service';
import { CategoryService } from '../../core/services/category.service';
import { Expense, Budget, IncomeSummary } from '../../core/models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe, DatePipe],
  template: `
    <div class="page-enter">
      <!-- ── Greeting ──────────────────────────────────────────── -->
      <div class="dashboard-greeting">
        <div>
          <h2 class="greeting-title">
            {{ getGreeting() }}, <span class="text-gradient">{{ getFirstName() }}!</span>
          </h2>
          <p class="text-muted text-sm">Here's your financial overview for {{ today | date:'MMMM yyyy' }}</p>
        </div>
        <div class="greeting-actions">
          <a routerLink="/expenses" class="btn btn-primary">
            <span class="material-icons-round" style="font-size:18px">add</span>
            Add Expense
          </a>
        </div>
      </div>

      <!-- ── Summary Cards ──────────────────────────────────────── -->
      <div class="stat-grid">
        <div class="stat-card">
          <div class="stat-card__icon" style="background: rgba(17,217,197,0.15); color: var(--color-success)">
            <span class="material-icons-round">trending_up</span>
          </div>
          <div>
            <p class="stat-card__label">Monthly Income</p>
            <p class="stat-card__value text-success">
              {{ incomeSummary()?.totalIncome | currency: (authService.currentUser()?.currency ?? 'USD') }}
            </p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-card__icon" style="background: rgba(255,107,138,0.15); color: var(--color-danger)">
            <span class="material-icons-round">receipt_long</span>
          </div>
          <div>
            <p class="stat-card__label">Monthly Expenses</p>
            <p class="stat-card__value text-danger">
              {{ incomeSummary()?.totalExpenses | currency: (authService.currentUser()?.currency ?? 'USD') }}
            </p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-card__icon" style="background: rgba(108,99,255,0.15); color: var(--color-primary-light)">
            <span class="material-icons-round">account_balance</span>
          </div>
          <div>
            <p class="stat-card__label">Net Balance</p>
            <p class="stat-card__value" [class.text-success]="(incomeSummary()?.netBalance ?? 0) >= 0" [class.text-danger]="(incomeSummary()?.netBalance ?? 0) < 0">
              {{ incomeSummary()?.netBalance | currency: (authService.currentUser()?.currency ?? 'USD') }}
            </p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-card__icon" style="background: rgba(255,179,71,0.15); color: var(--color-warning)">
            <span class="material-icons-round">savings</span>
          </div>
          <div>
            <p class="stat-card__label">Active Budgets</p>
            <p class="stat-card__value">{{ budgets().length }}</p>
            <p class="stat-card__trend down" *ngIf="getBudgetAlertCount() > 0">
              <span class="material-icons-round" style="font-size:14px">warning</span>
              {{ getBudgetAlertCount() }} alert{{ getBudgetAlertCount() !== 1 ? 's' : '' }}
            </p>
          </div>
        </div>
      </div>

      <!-- ── Main Content ───────────────────────────────────────── -->
      <div class="dashboard-main">

        <!-- Recent Expenses -->
        <div class="glass-card recent-card">
          <div class="card-header">
            <h3 class="card-title">Recent Expenses</h3>
            <a routerLink="/expenses" class="btn btn-ghost btn-sm">
              View all <span class="material-icons-round" style="font-size:14px">arrow_forward</span>
            </a>
          </div>

          <div *ngIf="loadingExpenses()" class="skeleton-list">
            <div class="skeleton skeleton-card" *ngFor="let i of [1,2,3]" style="height:56px"></div>
          </div>

          <table class="ss-table" *ngIf="!loadingExpenses() && recentExpenses().length > 0">
            <thead>
              <tr>
                <th>Description</th>
                <th>Category</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Mode</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let e of recentExpenses()">
                <td>
                  <span class="font-medium">{{ e.description }}</span>
                </td>
                <td>
                  <span class="badge badge-primary">{{ getExpenseCategoryName(e) }}</span>
                </td>
                <td class="text-muted text-sm">{{ e.date | date:'MMM d' }}</td>
                <td class="text-danger font-bold">
                  -{{ e.amount | currency: (authService.currentUser()?.currency ?? 'USD') }}
                </td>
                <td>
                  <span class="badge badge-muted">{{ e.paymentMode }}</span>
                </td>
              </tr>
            </tbody>
          </table>

          <div class="empty-state" *ngIf="!loadingExpenses() && recentExpenses().length === 0">
            <span class="empty-state__icon">📊</span>
            <p class="empty-state__title">No expenses yet</p>
            <p class="empty-state__desc">Start tracking by adding your first expense.</p>
            <a routerLink="/expenses" class="btn btn-primary btn-sm mt-md">Add Expense</a>
          </div>
        </div>

        <!-- Budget Overview -->
        <div class="glass-card budget-card">
          <div class="card-header">
            <h3 class="card-title">Budget Overview</h3>
            <a routerLink="/budgets" class="btn btn-ghost btn-sm">
              Manage <span class="material-icons-round" style="font-size:14px">arrow_forward</span>
            </a>
          </div>

          <div *ngIf="loadingBudgets()" class="skeleton-list">
            <div class="skeleton skeleton-card" *ngFor="let i of [1,2,3]" style="height:72px"></div>
          </div>

          <div class="budget-list" *ngIf="!loadingBudgets()">
            <div *ngFor="let b of budgets()" class="budget-item">
              <div class="budget-item__header">
                <div class="d-flex align-center gap-sm">
                  <div class="cat-dot" [style.background]="getBudgetColor(b)"></div>
                  <span class="font-medium text-sm">{{ getBudgetCategoryName(b) }}</span>
                  <span class="badge" [class]="getBudgetBadgeClass(b)">{{ b.status || 'Safe' }}</span>
                </div>
                <div class="budget-amounts">
                  <span class="text-sm font-bold" [class.text-danger]="getPercent(b) >= 100" [class.text-warning]="getPercent(b) >= 80 && getPercent(b) < 100" [class.text-success]="getPercent(b) < 80">
                    {{ b.spentAmount | currency: (authService.currentUser()?.currency ?? 'USD') }}
                  </span>
                  <span class="text-muted text-xs"> / {{ b.limitAmount | currency: (authService.currentUser()?.currency ?? 'USD') }}</span>
                </div>
              </div>
              <div class="progress-bar mt-sm">
                <div class="progress-bar__fill"
                     [style.width]="getPercent(b) + '%'"
                     [class.warning]="getPercent(b) >= 80 && getPercent(b) < 100"
                     [class.danger]="getPercent(b) >= 100">
                </div>
              </div>
              <span class="text-xs text-muted">{{ getPercent(b) }}% used · {{ b.period }}</span>
            </div>

            <div class="empty-state" *ngIf="budgets().length === 0">
              <span class="empty-state__icon">💰</span>
              <p class="empty-state__title">No budgets set</p>
              <a routerLink="/budgets" class="btn btn-primary btn-sm mt-md">Create Budget</a>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Income by Source ───────────────────────────────────── -->
      <div class="glass-card source-card" *ngIf="incomeSummary()?.bySource?.length">
        <div class="card-header">
          <h3 class="card-title">Income by Source</h3>
          <a routerLink="/income" class="btn btn-ghost btn-sm">View income</a>
        </div>
        <div class="source-grid">
          <div *ngFor="let s of incomeSummary()?.bySource" class="source-item">
            <div class="source-icon">
              <span class="material-icons-round">account_balance_wallet</span>
            </div>
            <div>
              <p class="font-medium text-sm">{{ s.source }}</p>
              <p class="text-success font-bold">{{ s.amount | currency: (authService.currentUser()?.currency ?? 'USD') }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-greeting {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: var(--space-xl);
      flex-wrap: wrap;
      gap: var(--space-md);
    }

    .greeting-title { font-size: 26px; font-weight: 800; margin-bottom: 4px; }

    .stat-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--space-md);
      margin-bottom: var(--space-xl);

      @media (max-width: 1200px) { grid-template-columns: repeat(2, 1fr); }
      @media (max-width: 600px)  { grid-template-columns: 1fr; }
    }

    .stat-card {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 16px;
      backdrop-filter: blur(16px);
      padding: var(--space-lg);
      display: flex;
      align-items: center;
      gap: var(--space-md);
      transition: transform var(--transition-base), border-color var(--transition-base);
      &:hover { transform: translateY(-4px); border-color: rgba(108,99,255,0.5); }
    }

    .stat-card__icon {
      width: 48px; height: 48px;
      border-radius: var(--radius-md);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      .material-icons-round { font-size: 24px; }
    }

    .stat-card__label { font-size: 12px; color: var(--text-secondary); font-weight: 500; margin-bottom: 4px; letter-spacing: 0.3px; }
    .stat-card__value { font-size: 22px; font-weight: 700; }
    .stat-card__trend { font-size: 12px; display: flex; align-items: center; gap: 3px; margin-top: 4px; }
    .stat-card__trend.down { color: var(--color-danger); }

    .dashboard-main {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: var(--space-xl);
      margin-bottom: var(--space-xl);
      @media (max-width: 1024px) { grid-template-columns: 1fr; }
    }

    .card-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: var(--space-lg);
    }

    .card-title { font-size: 16px; font-weight: 700; }

    .recent-card, .budget-card { padding: var(--space-lg); }

    .skeleton-list { display: flex; flex-direction: column; gap: var(--space-sm); }

    .budget-list { display: flex; flex-direction: column; gap: var(--space-md); }

    .budget-item {
      padding: var(--space-md);
      background: var(--color-surface);
      border-radius: var(--radius-md);
      border: 1px solid var(--color-border);
    }

    .budget-item__header {
      display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-sm);
    }

    .budget-amounts { text-align: right; }

    .cat-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }

    .source-card { padding: var(--space-lg); }

    .source-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: var(--space-md);
    }

    .source-item {
      display: flex; align-items: center; gap: 12px;
      padding: var(--space-md);
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
    }

    .source-icon {
      width: 40px; height: 40px;
      background: rgba(17,217,197,0.1);
      color: var(--color-success);
      border-radius: var(--radius-md);
      display: flex; align-items: center; justify-content: center;
    }
  `]
})
export class DashboardComponent implements OnInit {
  authService    = inject(AuthService);
  expenseService = inject(ExpenseService);
  budgetService  = inject(BudgetService);
  incomeService  = inject(IncomeService);
  categoryService = inject(CategoryService);

  today = new Date();
  recentExpenses   = signal<Expense[]>([]);
  budgets          = signal<Budget[]>([]);
  incomeSummary    = signal<IncomeSummary | null>(null);
  categories       = signal<any[]>([]);
  loadingExpenses  = signal(true);
  loadingBudgets   = signal(true);

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.expenseService.getExpenses({ page: 1, pageSize: 5 }).subscribe({
      next: res => { this.recentExpenses.set(res.items); this.loadingExpenses.set(false); },
      error: () => this.loadingExpenses.set(false)
    });

    this.budgetService.getBudgets().subscribe({
      next: res => { this.budgets.set(res); this.loadingBudgets.set(false); },
      error: () => this.loadingBudgets.set(false)
    });

    this.incomeService.getSummary().subscribe({
      next: res => this.incomeSummary.set(res),
      error: () => {}
    });

    this.categoryService.getCategories().subscribe({
      next: res => this.categories.set(res),
      error: () => {}
    });
  }

  getGreeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }

  getFirstName(): string {
    const name = this.authService.currentUser()?.name || 'User';
    return name.split(' ')[0];
  }

  getPercent(b: Budget): number {
    return Math.min(Math.round((b.spentAmount / b.limitAmount) * 100), 100);
  }

  getBudgetAlertCount(): number {
    return this.budgets().filter(b => this.getPercent(b) >= 80).length;
  }

  getBudgetBadgeClass(b: Budget): string {
    const p = this.getPercent(b);
    if (p >= 100) return 'badge badge-danger';
    if (p >= 80)  return 'badge badge-warning';
    return 'badge badge-success';
  }

  getExpenseCategoryName(expense: Expense): string {
    return expense.categoryName || this.categories().find(category => category.categoryId === expense.categoryId)?.name || 'Other';
  }

  getBudgetCategoryName(budget: Budget): string {
    return budget.categoryName || this.categories().find(category => category.categoryId === budget.categoryId)?.name || 'Budget';
  }

  getBudgetColor(budget: Budget): string {
    return budget.categoryColor || this.categories().find(category => category.categoryId === budget.categoryId)?.color || '#6C63FF';
  }
}
