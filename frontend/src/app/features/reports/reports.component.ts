import { Component, OnInit, inject, signal, AfterViewInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../core/services/report.service';
import { AuthService } from '../../core/services/auth.service';
import { BudgetService } from '../../core/services/budget.service';
import { CategoryService } from '../../core/services/category.service';
import { ToastService } from '../../core/services/toast.service';
import { Budget, Category, MonthlyReport } from '../../core/models/models';

interface BudgetComparison {
  categoryName: string;
  categoryColor: string;
  spent: number;
  limit: number;
  percent: number;
  status: 'Safe' | 'Warning' | 'Breached';
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, DatePipe],
  template: `
    <div class="page-enter">
      <div class="page-header-row">
        <div>
          <h2 class="page-title-text">Reports & Analytics</h2>
          <p class="text-muted text-sm">Insights into your financial patterns</p>
        </div>
        <div class="report-controls">
          <select class="form-control" [(ngModel)]="selectedMonth" (change)="loadReport()">
            <option *ngFor="let m of months; let i = index" [value]="i + 1">{{ m }}</option>
          </select>
          <select class="form-control" [(ngModel)]="selectedYear" (change)="loadReport()">
            <option *ngFor="let y of years" [value]="y">{{ y }}</option>
          </select>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="loading()" class="skeleton-list">
        <div class="skeleton" style="height:120px;margin-bottom:16px"></div>
        <div class="report-grid">
          <div class="skeleton skeleton-card" *ngFor="let i of [1,2,3]" style="height:300px"></div>
        </div>
      </div>

      <div *ngIf="!loading() && report()">
        <!-- Summary Row -->
        <div class="report-summary">
          <div class="glass-card summary-item">
            <div class="summary-icon income"><span class="material-icons-round">trending_up</span></div>
            <div>
              <p class="stat-label">Total Income</p>
              <p class="stat-value text-success">{{ report()!.totalIncome | currency: (authService.currentUser()?.currency ?? 'USD') }}</p>
            </div>
          </div>
          <div class="glass-card summary-item">
            <div class="summary-icon expense"><span class="material-icons-round">trending_down</span></div>
            <div>
              <p class="stat-label">Total Expenses</p>
              <p class="stat-value text-danger">{{ report()!.totalExpenses | currency: (authService.currentUser()?.currency ?? 'USD') }}</p>
            </div>
          </div>
          <div class="glass-card summary-item">
            <div class="summary-icon savings"><span class="material-icons-round">savings</span></div>
            <div>
              <p class="stat-label">Net Savings</p>
              <p class="stat-value" [class.text-success]="report()!.netSavings >= 0" [class.text-danger]="report()!.netSavings < 0">
                {{ report()!.netSavings | currency: (authService.currentUser()?.currency ?? 'USD') }}
              </p>
            </div>
          </div>
          <div class="glass-card summary-item">
            <div class="summary-icon rate"><span class="material-icons-round">percent</span></div>
            <div>
              <p class="stat-label">Savings Rate</p>
              <p class="stat-value" [class.text-success]="getSavingsRate() >= 20" [class.text-warning]="getSavingsRate() > 0 && getSavingsRate() < 20" [class.text-danger]="getSavingsRate() <= 0">
                {{ getSavingsRate() }}%
              </p>
            </div>
          </div>
        </div>

        <!-- Charts Row -->
        <div class="report-grid">
          <!-- Daily Trend -->
          <div class="glass-card chart-card daily-trend-card">
            <h3 class="chart-title">Daily Spending Trend</h3>
            <div class="daily-chart">
              <div *ngFor="let d of report()!.dailyExpenses" class="daily-bar-wrap">
                <div class="daily-bar-tooltip">
                  <span class="tooltip-date">{{ d.date | date:'EEE, MMM d' }}</span>
                  <span class="tooltip-amount">{{ d.amount | currency: (authService.currentUser()?.currency ?? 'USD') }}</span>
                </div>
                <div class="daily-bar" [style.height]="getBarHeight(d.amount) + '%'"></div>
                <span class="daily-label">{{ d.date | date:'d' }}</span>
              </div>
            </div>
          </div>

          <!-- Savings Health -->
          <div class="glass-card chart-card">
            <h3 class="chart-title">Financial Health Score</h3>
            <div class="health-score">
              <div class="score-ring">
                <svg viewBox="0 0 120 120" class="ring-svg">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="10"/>
                  <circle cx="60" cy="60" r="50" fill="none" [attr.stroke]="getHealthColor()" stroke-width="10"
                    stroke-linecap="round" stroke-dasharray="314"
                    [attr.stroke-dashoffset]="314 - (getHealthScore() / 100 * 314)"
                    transform="rotate(-90 60 60)"
                    style="transition: stroke-dashoffset 1s ease"/>
                </svg>
                <div class="score-label">
                  <span class="score-num" [style.color]="getHealthColor()">{{ getHealthScore() }}</span>
                  <span class="score-sub">/ 100</span>
                </div>
              </div>
              <div class="health-breakdown">
                <div class="health-item">
                  <span class="material-icons-round" style="color:var(--color-success)">check_circle</span>
                  <span class="text-sm">Savings rate: {{ getSavingsRate() }}%</span>
                </div>
                  <div class="health-item">
                    <span class="material-icons-round" [style.color]="getExpenseRatio() <= 80 ? 'var(--color-success)' : 'var(--color-warning)'">
                      {{ getExpenseRatio() <= 80 ? 'check_circle' : 'warning' }}
                    </span>
                    <span class="text-sm">Spending: {{ getExpenseRatio() }}% of income</span>
                  </div>
                <div class="health-item">
                  <span class="material-icons-round" [style.color]="getCatHealthColor()">
                    {{ getCatHealthIcon() }}
                  </span>
                  <span class="text-sm">Categories tracked: {{ getCatCount() }}</span>
                </div>
                <div class="health-item">
                  <span class="material-icons-round" [style.color]="report()!.netSavings >= 0 ? 'var(--color-success)' : 'var(--color-danger)'">
                    {{ report()!.netSavings >= 0 ? 'check_circle' : 'cancel' }}
                  </span>
                  <span class="text-sm">Positive balance: {{ report()!.netSavings >= 0 ? 'Yes' : 'No' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Budget Comparison -->
          <div class="glass-card chart-card budget-chart-card">
            <div class="chart-heading">
              <div>
                <h3 class="chart-title">Expense vs Budget</h3>
                <p class="text-muted text-xs">Compare your spending against active budgets</p>
              </div>
              <div class="budget-summary">
                <span class="summary-pill success">{{ getBudgetSummary().safe }} on track</span>
                <span class="summary-pill warning">{{ getBudgetSummary().warning }} watch</span>
                <span class="summary-pill danger">{{ getBudgetSummary().breached }} over</span>
              </div>
            </div>

            <div class="budget-compare-list" *ngIf="getBudgetComparisons().length; else noBudgetState">
              <div *ngFor="let item of getBudgetComparisons()" class="budget-compare-row">
                <div class="budget-compare-row__header">
                  <div class="d-flex align-center gap-sm">
                    <div class="cat-color-dot" [style.background]="item.categoryColor"></div>
                    <span class="font-medium text-sm">{{ item.categoryName }}</span>
                  </div>
                  <div class="text-right">
                    <p class="font-bold text-sm">{{ item.spent | currency: (authService.currentUser()?.currency ?? 'USD') }}</p>
                    <p class="text-xs text-muted">of {{ item.limit | currency: (authService.currentUser()?.currency ?? 'USD') }}</p>
                  </div>
                </div>

                <div class="progress-bar budget-progress">
                  <div class="progress-bar__fill"
                       [style.width]="Math.min(item.percent, 100) + '%'"
                       [style.background]="item.status === 'Breached' ? 'linear-gradient(90deg, #ff6b8a, #ff8f70)' : item.status === 'Warning' ? 'linear-gradient(90deg, #ffb347, #ffd76b)' : 'var(--gradient-primary)'">
                  </div>
                </div>

                <div class="budget-compare-row__footer">
                  <span class="badge"
                        [class.badge-success]="item.status === 'Safe'"
                        [class.badge-warning]="item.status === 'Warning'"
                        [class.badge-danger]="item.status === 'Breached'">
                    {{ item.status }}
                  </span>
                  <span class="text-xs text-muted">
                    {{ item.percent }}% used · {{ item.limit - item.spent >= 0 ? 'Remaining ' : 'Over ' }}
                    {{ Math.abs(item.limit - item.spent) | currency: (authService.currentUser()?.currency ?? 'USD') }}
                  </span>
                </div>
              </div>
            </div>

            <ng-template #noBudgetState>
              <div class="empty-state empty-state--compact">
                <span class="empty-state__icon" style="font-size:28px">🎯</span>
                <p class="empty-state__title" style="font-size:14px">No active budget data</p>
                <p class="empty-state__desc">Create budgets to compare spending against limits here.</p>
              </div>
            </ng-template>
          </div>
        </div>
      </div>

      <div class="empty-state" *ngIf="!loading() && !report()">
        <span class="empty-state__icon">📈</span>
        <p class="empty-state__title">No report data</p>
        <p class="empty-state__desc">Add expenses and income to generate reports.</p>
      </div>
    </div>
  `,
  styles: [`
    .page-header-row { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: var(--space-xl); flex-wrap: wrap; gap: var(--space-md); }
    .page-title-text { font-size: 24px; font-weight: 700; margin-bottom: 4px; }
    .report-controls { display: flex; gap: var(--space-sm); flex-wrap: wrap; }
    .report-summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-md); margin-bottom: var(--space-xl); @media (max-width: 1024px) { grid-template-columns: repeat(2, 1fr); } @media (max-width: 600px) { grid-template-columns: 1fr; } }
    .summary-item { padding: var(--space-lg); display: flex; align-items: center; gap: var(--space-md); }
    .summary-icon { width: 44px; height: 44px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; flex-shrink: 0; .material-icons-round { font-size: 22px; } &.income { background: rgba(17,217,197,0.15); color: var(--color-success); } &.expense { background: rgba(255,107,138,0.15); color: var(--color-danger); } &.savings { background: rgba(108,99,255,0.15); color: var(--color-primary-light); } &.rate { background: rgba(255,179,71,0.15); color: var(--color-warning); } }
    .stat-label { font-size: 12px; color: var(--text-secondary); font-weight: 500; margin-bottom: 4px; }
    .stat-value { font-size: 20px; font-weight: 700; }
    .report-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-lg); @media (max-width: 1024px) { grid-template-columns: 1fr; } }
    .chart-card { padding: var(--space-lg); overflow: visible; }
    .budget-chart-card { grid-column: 1 / -1; }
    .chart-title { font-size: 15px; font-weight: 700; margin-bottom: var(--space-lg); }
    .chart-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--space-md); margin-bottom: var(--space-md); }
    .budget-summary { display: flex; flex-wrap: wrap; gap: 8px; justify-content: flex-end; }
    .summary-pill { padding: 6px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; }
    .summary-pill.success { background: rgba(17,217,197,0.12); color: var(--color-success); }
    .summary-pill.warning { background: rgba(255,179,71,0.12); color: var(--color-warning); }
    .summary-pill.danger { background: rgba(255,107,138,0.12); color: var(--color-danger); }
.daily-trend-card { grid-column: 1 / span 2; overflow: visible; }
    .budget-compare-list { display: flex; flex-direction: column; gap: 14px; }
    .budget-compare-row { padding: 14px; border-radius: var(--radius-md); background: rgba(255,255,255,0.03); border: 1px solid var(--color-border); }
    .budget-compare-row__header { display: flex; align-items: center; justify-content: space-between; gap: var(--space-sm); }
    .budget-progress { height: 8px; margin-top: 10px; }
    .budget-compare-row__footer { display: flex; align-items: center; justify-content: space-between; gap: var(--space-sm); margin-top: 8px; }
    .daily-chart { display: flex; align-items: flex-end; gap: 8px; height: 240px; padding: 80px 32px 28px 32px; position: relative; overflow-x: auto; overflow-y: visible; min-width: 0; scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.15) transparent; }
    .daily-chart::-webkit-scrollbar { height: 5px; }
    .daily-chart::-webkit-scrollbar-track { background: transparent; }
    .daily-chart::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 3px; }
    .daily-chart::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.25); }
    .daily-bar-wrap { position: relative; flex: 0 0 auto; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; gap: 6px; height: 100%; width: 48px; overflow: visible; }
    .daily-bar-tooltip { position: absolute; left: 50%; top: -70px; transform: translateX(-50%) translateY(6px); opacity: 0; pointer-events: none; z-index: 10; min-width: 148px; padding: 12px 14px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.15); background: rgba(18, 19, 31, 0.98); box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255,255,255,0.05); backdrop-filter: blur(20px); display: flex; flex-direction: column; align-items: center; gap: 3px; transition: opacity 0.2s ease, transform 0.2s ease; will-change: transform, opacity; }
    .daily-bar-tooltip::after { content: ''; position: absolute; left: 50%; bottom: -7px; width: 13px; height: 13px; transform: translateX(-50%) rotate(45deg); background: rgba(18, 19, 31, 0.98); border-right: 1px solid rgba(255,255,255,0.15); border-bottom: 1px solid rgba(255,255,255,0.15); box-shadow: -2px 2px 4px rgba(0, 0, 0, 0.4); }
    .daily-bar-wrap:hover .daily-bar-tooltip { opacity: 1; transform: translateX(-50%) translateY(0); }
    .tooltip-date { font-size: 10px; color: var(--text-secondary); letter-spacing: 0.3px; }
    .tooltip-amount { font-size: 14px; font-weight: 700; color: var(--color-primary-light); }
    .daily-bar { width: 100%; background: var(--gradient-primary); border-radius: 6px 6px 0 0; min-height: 8px; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); opacity: 0.85; box-shadow: 0 4px 12px rgba(108, 99, 255, 0.2); &:hover { opacity: 1; box-shadow: 0 8px 20px rgba(108, 99, 255, 0.35); transform: translateY(-2px); } }
    .daily-label { font-size: 10px; color: var(--text-secondary); margin-top: 2px; }
    .health-score { display: flex; flex-direction: column; align-items: center; gap: var(--space-lg); }
    .score-ring { position: relative; width: 140px; height: 140px; }
    .ring-svg { width: 100%; height: 100%; }
    .score-label { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .score-num { font-size: 32px; font-weight: 800; }
    .score-sub { font-size: 12px; color: var(--text-muted); }
    .health-breakdown { width: 100%; display: flex; flex-direction: column; gap: 10px; }
    .health-item { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--text-secondary); }
    .skeleton-list { display: flex; flex-direction: column; gap: var(--space-md); }
  `]
})
export class ReportsComponent implements OnInit {
  reportService = inject(ReportService);
  authService   = inject(AuthService);
  budgetService = inject(BudgetService);
  categoryService = inject(CategoryService);
  toast         = inject(ToastService);

  Math = Math;

  report      = signal<MonthlyReport | null>(null);
  budgets     = signal<Budget[]>([]);
  categories  = signal<Category[]>([]);
  loading     = signal(true);

  selectedMonth = new Date().getMonth() + 1;
  selectedYear  = new Date().getFullYear();

  months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  years  = [2022, 2023, 2024, 2025, 2026];

  ngOnInit(): void {
    this.loadBudgets();
    this.loadCategories();
    this.loadReport();
  }

  loadBudgets(): void {
    this.budgetService.getBudgets().subscribe({
      next: b => this.budgets.set(b),
      error: () => this.budgets.set([])
    });
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: c => this.categories.set(c),
      error: () => this.categories.set([])
    });
  }

  loadReport(): void {
    this.loading.set(true);
    this.reportService.getMonthlyReport(this.selectedYear, this.selectedMonth).subscribe({
      next: r => { this.report.set(r); this.loading.set(false); },
      error: () => { this.report.set(null); this.loading.set(false); }
    });
  }

  getSavingsRate(): number {
    const r = this.report();
    if (!r || r.totalIncome === 0) return 0;
    return Math.round((r.netSavings / r.totalIncome) * 100);
  }

  getHealthScore(): number {
    const rate = this.getSavingsRate();
    const balance = (this.report()?.netSavings ?? 0) >= 0 ? 25 : 0;
    const savingsScore = Math.min(rate * 0.25, 25);
    const catScore = Math.min((this.report()?.expensesByCategory?.length ?? 0) * 4, 20);
    const expenseRatioScore = this.getExpenseRatioScore();
    const budgetScore = this.getBudgetAdherenceScore();
    return Math.min(balance + savingsScore + catScore + expenseRatioScore + budgetScore, 100);
  }

  getExpenseRatioScore(): number {
    const r = this.report();
    if (!r || r.totalIncome === 0) return 0;
    const expenseRatio = r.totalExpenses / r.totalIncome;
    
    // Reward healthy spending ratios
    if (expenseRatio <= 0.5) return 30;      // Excellent: spending ≤ 50% of income
    if (expenseRatio <= 0.7) return 28;      // Very good: 50-70% of income
    if (expenseRatio <= 0.8) return 24;      // Good: 70-80% of income
    if (expenseRatio <= 0.9) return 18;      // Acceptable: 80-90% of income
    if (expenseRatio <= 1.0) return 10;      // Concerning: 90-100% of income
    return 0;                                 // Unhealthy: spending > income
  }

  getExpenseRatio(): number {
    const r = this.report();
    if (!r || r.totalIncome === 0) return 0;
    return Math.round((r.totalExpenses / r.totalIncome) * 100);
  }

  getBudgetComparisons(): BudgetComparison[] {
    const report = this.report();
    if (!report) return [];

    const monthStart = new Date(this.selectedYear, this.selectedMonth - 1, 1);
    const monthEnd = new Date(this.selectedYear, this.selectedMonth, 0);

    return this.budgets()
      .filter(budget => {
        const start = new Date(budget.startDate);
        const end = new Date(budget.endDate);
        return start <= monthEnd && end >= monthStart;
      })
      .map(budget => {
        const categoryName = this.getBudgetCategoryName(budget.categoryId);
        const breakdown = report.expensesByCategory.find(item => item.categoryName.toLowerCase() === categoryName.toLowerCase());
        const spent = breakdown?.amount ?? 0;
        const percent = budget.limitAmount > 0 ? Math.round((spent / budget.limitAmount) * 100) : 0;
        const status: BudgetComparison['status'] = percent >= 100 ? 'Breached' : percent >= 80 ? 'Warning' : 'Safe';

        return {
          categoryName,
          categoryColor: this.getBudgetCategoryColor(budget.categoryId),
          spent,
          limit: budget.limitAmount,
          percent,
          status,
        };
      })
      .sort((left, right) => right.percent - left.percent);
  }

  getBudgetSummary(): { safe: number; warning: number; breached: number } {
    const comparisons = this.getBudgetComparisons();
    return {
      safe: comparisons.filter(item => item.status === 'Safe').length,
      warning: comparisons.filter(item => item.status === 'Warning').length,
      breached: comparisons.filter(item => item.status === 'Breached').length,
    };
  }

  getBudgetCategoryName(categoryId: string): string {
    return this.categories().find(category => category.categoryId === categoryId)?.name ?? 'Budget';
  }

  getBudgetCategoryColor(categoryId: string): string {
    return this.categories().find(category => category.categoryId === categoryId)?.color ?? '#6C63FF';
  }

  getBudgetAdherenceScore(): number {
    const comparisons = this.getBudgetComparisons();
    if (!comparisons.length) return 0;
    const healthyCount = comparisons.filter(item => item.percent <= 80).length;
    return Math.round((healthyCount / comparisons.length) * 20);
  }
  getHealthColor(): string {
    const s = this.getHealthScore();
    if (s >= 70) return 'var(--color-success)';
    if (s >= 40) return 'var(--color-warning)';
    return 'var(--color-danger)';
  }

  getMaxDaily(): number {
    const items = this.report()?.dailyExpenses ?? [];
    return Math.max(...items.map(d => d.amount), 1);
  }

  getBarHeight(amount: number): number {
    return Math.max((amount / this.getMaxDaily()) * 100, 4);
  }

  getCatCount(): number { return this.report()?.expensesByCategory?.length ?? 0; }
  getCatHealthColor(): string { return this.getCatCount() > 3 ? 'var(--color-success)' : 'var(--color-warning)'; }
  getCatHealthIcon(): string { return this.getCatCount() > 3 ? 'check_circle' : 'warning'; }
}
