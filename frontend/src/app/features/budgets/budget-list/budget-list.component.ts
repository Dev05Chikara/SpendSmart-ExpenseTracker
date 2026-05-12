import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { BudgetService } from '../../../core/services/budget.service';
import { CategoryService } from '../../../core/services/category.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';
import { Budget, Category } from '../../../core/models/models';

@Component({
  selector: 'app-budget-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe],
  template: `
    <div class="page-enter">
      <div class="page-header-row">
        <div>
          <h2 class="page-title-text">Budgets</h2>
          <p class="text-muted text-sm">Set spending limits and track your progress</p>
        </div>
        <button class="btn btn-primary" (click)="openForm()">
          <span class="material-icons-round" style="font-size:18px">add</span>
          Create Budget
        </button>
      </div>

      <!-- Budget Alert Banner -->
      <div class="alert-banner" *ngIf="getBreachedBudgets().length > 0">
        <span class="material-icons-round" style="color:var(--color-danger)">warning</span>
        <span>
          <strong>{{ getBreachedBudgets().length }} budget{{ getBreachedBudgets().length > 1 ? 's' : '' }} exceeded!</strong>
          Review your spending for {{ getBreachedNames() }}.
        </span>
      </div>

      <!-- Budget Cards -->
      <div class="budget-grid" *ngIf="!loading()">
        <div *ngFor="let b of budgets()" class="glass-card budget-card" [class.breached]="getPercent(b) >= 100" [class.warning]="getPercent(b) >= 80 && getPercent(b) < 100">

          <div class="budget-card__header">
            <div class="d-flex align-center gap-md">
              <div class="cat-icon-sm" [style.background]="getCategoryColor(b.categoryId)">
                <span style="font-size:20px">{{ getCategoryIcon(b.categoryId) }}</span>
              </div>
              <div>
                <p class="font-bold" style="font-size:15px">{{ getCategoryName(b.categoryId) }}</p>
                <p class="text-muted text-xs">{{ b.period }} · {{ b.startDate | date:'MMM d' }} – {{ b.endDate | date:'MMM d' }}</p>
              </div>
            </div>
            <div class="budget-actions">
              <span class="badge" [class]="getStatusBadge(b)">{{ getStatus(b) }}</span>
              <button class="btn btn-icon" (click)="editBudget(b)"><span class="material-icons-round" style="font-size:15px">edit</span></button>
              <button class="btn btn-icon" style="color:var(--color-danger)" (click)="deleteBudget(b)"><span class="material-icons-round" style="font-size:15px">delete</span></button>
            </div>
          </div>

          <div class="budget-amounts">
            <div>
              <p class="text-xs text-muted">Spent</p>
              <p class="font-bold" style="font-size:18px" [class.text-danger]="getPercent(b) >= 100" [class.text-warning]="getPercent(b) >= 80 && getPercent(b) < 100" [class.text-success]="getPercent(b) < 80">
                {{ b.spentAmount | currency: (authService.currentUser()?.currency ?? 'USD') }}
              </p>
            </div>
            <div class="text-right">
              <p class="text-xs text-muted">Limit</p>
              <p class="font-bold" style="font-size:18px">{{ b.limitAmount | currency: (authService.currentUser()?.currency ?? 'USD') }}</p>
            </div>
          </div>

          <div class="progress-bar" style="height:8px">
            <div class="progress-bar__fill"
                 [style.width]="getPercent(b) + '%'"
                 [class.warning]="getPercent(b) >= 80 && getPercent(b) < 100"
                 [class.danger]="getPercent(b) >= 100">
            </div>
          </div>

          <div class="budget-footer">
            <span class="text-sm text-muted">{{ getPercent(b) }}% used</span>
            <span class="text-sm" [class.text-danger]="getRemaining(b) < 0" [class.text-success]="getRemaining(b) >= 0">
              {{ getRemaining(b) >= 0 ? 'Remaining: ' : 'Over by: ' }}
              {{ Math.abs(getRemaining(b)) | currency: (authService.currentUser()?.currency ?? 'USD') }}
            </span>
          </div>
        </div>
      </div>

      <div class="empty-state" *ngIf="budgets().length === 0 && !loading()">
        <span class="empty-state__icon">💰</span>
        <p class="empty-state__title">No budgets yet</p>
        <p class="empty-state__desc">Create a budget to track your spending limits.</p>
        <button class="btn btn-primary btn-sm mt-md" (click)="openForm()">Create Budget</button>
      </div>

      <!-- Modal -->
      <div class="modal-backdrop" *ngIf="showForm()" (click)="closeForm()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ editMode() ? 'Edit' : 'Create' }} Budget</h3>
            <button class="btn btn-icon" (click)="closeForm()"><span class="material-icons-round">close</span></button>
          </div>
          <form [formGroup]="form" (ngSubmit)="save()" class="modal-form">
            <div class="form-grid">
              <div class="form-group span-2">
                <label>Category</label>
                <select formControlName="categoryId" class="form-control">
                  <option value="">-- Select Category --</option>
                  <option *ngFor="let c of categories()" [value]="c.categoryId">{{ c.icon }} {{ c.name }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>Limit Amount *</label>
                <input type="number" formControlName="limitAmount" class="form-control" placeholder="0.00">
              </div>
              <div class="form-group">
                <label>Period</label>
                <select formControlName="period" class="form-control">
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Yearly">Yearly</option>
                </select>
              </div>
              <div class="form-group">
                <label>Start Date *</label>
                <input type="date" formControlName="startDate" class="form-control">
              </div>
              <div class="form-group">
                <label>End Date *</label>
                <input type="date" formControlName="endDate" class="form-control">
              </div>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" (click)="closeForm()">Cancel</button>
              <button type="submit" class="btn btn-primary" [disabled]="form.invalid || saving()">
                {{ saving() ? 'Saving...' : (editMode() ? 'Update' : 'Create Budget') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header-row { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: var(--space-xl); flex-wrap: wrap; gap: var(--space-md); }
    .page-title-text { font-size: 24px; font-weight: 700; margin-bottom: 4px; }
    .alert-banner { display: flex; align-items: center; gap: 10px; padding: 14px 20px; background: rgba(255,107,138,0.1); border: 1px solid rgba(255,107,138,0.3); border-radius: var(--radius-md); margin-bottom: var(--space-lg); font-size: 14px; }
    .budget-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: var(--space-lg); }
    .budget-card { padding: var(--space-lg); display: flex; flex-direction: column; gap: 12px; &.breached { border-color: rgba(255,107,138,0.35); } &.warning { border-color: rgba(255,179,71,0.35); } }
    .budget-card__header { display: flex; align-items: flex-start; justify-content: space-between; }
    .cat-icon-sm { width: 44px; height: 44px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .budget-actions { display: flex; align-items: center; gap: 4px; }
    .budget-amounts { display: flex; justify-content: space-between; }
    .budget-footer { display: flex; justify-content: space-between; }
    .modal-form { display: flex; flex-direction: column; gap: var(--space-md); }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md); }
    .span-2 { grid-column: 1 / -1; }
    .modal-actions { display: flex; justify-content: flex-end; gap: var(--space-sm); }
    .text-right { text-align: right; }
  `]
})
export class BudgetListComponent implements OnInit {
  budgetService   = inject(BudgetService);
  categoryService = inject(CategoryService);
  toast           = inject(ToastService);
  authService     = inject(AuthService);
  private fb      = inject(FormBuilder);

  Math = Math;

  budgets    = signal<Budget[]>([]);
  categories = signal<Category[]>([]);
  loading    = signal(true);
  showForm   = signal(false);
  editMode   = signal(false);
  saving     = signal(false);
  editingId: string | null = null;

  form = this.fb.group({
    categoryId:  [''],
    limitAmount: [null as any, [Validators.required, Validators.min(1)]],
    period:      ['Monthly'],
    startDate:   ['', Validators.required],
    endDate:     ['', Validators.required]
  });

  ngOnInit(): void {
    this.load();
    this.categoryService.getCategories().subscribe(c => this.categories.set(c));
  }

  load(): void {
    this.budgetService.getBudgets().subscribe({ next: b => { this.budgets.set(b); this.loading.set(false); }, error: () => this.loading.set(false) });
  }

  getCategoryName(categoryId: string): string {
    return this.categories().find(category => category.categoryId === categoryId)?.name ?? 'Budget';
  }

  getCategoryIcon(categoryId: string): string {
    return this.categories().find(category => category.categoryId === categoryId)?.icon ?? '💰';
  }

  getCategoryColor(categoryId: string): string {
    const color = this.categories().find(category => category.categoryId === categoryId)?.color ?? '#6C63FF';
    return `${color}26`;
  }

  getPercent(b: Budget): number { return Math.min(Math.round((b.spentAmount / b.limitAmount) * 100), 100); }
  getRemaining(b: Budget): number { return b.limitAmount - b.spentAmount; }
  getBreachedBudgets(): Budget[] { return this.budgets().filter(b => this.getPercent(b) >= 100); }
  getBreachedNames(): string { return this.getBreachedBudgets().map(b => b.categoryName || 'Budget').join(', '); }
  getStatus(b: Budget): string { const p = this.getPercent(b); if (p >= 100) return 'Breached'; if (p >= 80) return 'Warning'; return 'Safe'; }
  getStatusBadge(b: Budget): string { const p = this.getPercent(b); if (p >= 100) return 'badge badge-danger'; if (p >= 80) return 'badge badge-warning'; return 'badge badge-success'; }

  openForm(): void {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const end   = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    this.editMode.set(false); this.editingId = null;
    this.form.reset({ period: 'Monthly', startDate: start, endDate: end });
    this.showForm.set(true);
  }

  closeForm(): void { this.showForm.set(false); }

  editBudget(b: Budget): void {
    this.editMode.set(true); this.editingId = b.budgetId;
    this.form.patchValue({ categoryId: b.categoryId, limitAmount: b.limitAmount, period: b.period, startDate: b.startDate.split('T')[0], endDate: b.endDate.split('T')[0] });
    this.showForm.set(true);
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const obs = this.editMode() && this.editingId
      ? this.budgetService.updateBudget(this.editingId, this.form.value as any)
      : this.budgetService.createBudget(this.form.value as any);
    obs.subscribe({ next: () => { this.toast.success('Budget saved!'); this.closeForm(); this.load(); this.saving.set(false); }, error: () => this.saving.set(false) });
  }

  deleteBudget(b: Budget): void {
    if (!confirm(`Delete this budget?`)) return;
    this.budgetService.deleteBudget(b.budgetId).subscribe({ next: () => { this.toast.success('Budget deleted.'); this.load(); } });
  }
}
