import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ExpenseService } from '../../../core/services/expense.service';
import { CategoryService } from '../../../core/services/category.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';
import { Expense, Category, ExpenseFilter, PagedResult } from '../../../core/models/models';

@Component({
  selector: 'app-expense-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe, DatePipe],
  template: `
    <div class="page-enter">
      <!-- Header -->
      <div class="page-header-row">
        <div>
          <h2 class="page-title-text">Expenses</h2>
          <p class="text-muted text-sm">Track and manage all your spending</p>
        </div>
        <button class="btn btn-primary" (click)="openForm()">
          <span class="material-icons-round" style="font-size:18px">add</span>
          Add Expense
        </button>
      </div>

      <!-- Filter Bar -->
      <div class="glass-card filter-card">
        <div class="filter-grid">
          <div class="input-icon-wrap">
            <span class="material-icons-round input-icon">search</span>
            <input type="text" class="form-control with-icon" placeholder="Search expenses..."
                   (input)="onSearch($event)">
          </div>
          <select class="form-control" (change)="onCategoryFilter($event)">
            <option value="">All Categories</option>
            <option *ngFor="let c of categories()" [value]="c.categoryId">{{ c.name }}</option>
          </select>
          <select class="form-control" (change)="onPaymentFilter($event)">
            <option value="">All Payment Modes</option>
            <option value="Cash">Cash</option>
            <option value="Card">Card</option>
            <option value="UPI">UPI</option>
            <option value="BankTransfer">Bank Transfer</option>
            <option value="Other">Other</option>
          </select>
          <input type="date" class="form-control" placeholder="From" (change)="onDateFrom($event)">
          <input type="date" class="form-control" placeholder="To" (change)="onDateTo($event)">
        </div>
      </div>

      <!-- Table -->
      <div class="glass-card table-card">
        <div *ngIf="loading()" class="skeleton-list p-lg">
          <div class="skeleton" style="height:48px;margin-bottom:8px" *ngFor="let i of [1,2,3,4,5]"></div>
        </div>

        <table class="ss-table" *ngIf="!loading() && expenses().length > 0">
          <thead>
            <tr>
              <th>Description</th>
              <th>Category</th>
              <th>Date</th>
              <th>Payment</th>
              <th>Recurring</th>
              <th>Amount</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let e of expenses()">
              <td>
                <div class="d-flex align-center gap-sm">
                  <div class="expense-avatar" [style.background]="getExpenseColor(e)">
                    <span class="material-icons-round" style="font-size:14px" [style.color]="getExpenseAccent(e)">
                      {{ getExpenseIcon(e) }}
                    </span>
                  </div>
                  <span class="font-medium">{{ e.description }}</span>
                </div>
              </td>
              <td><span class="chip">{{ getExpenseCategoryName(e) }}</span></td>
              <td class="text-muted text-sm">{{ e.date | date:'MMM d, yyyy' }}</td>
              <td><span class="badge badge-info">{{ e.paymentMode }}</span></td>
              <td>
                <span class="badge" [class.badge-primary]="e.isRecurring" [class.badge-muted]="!e.isRecurring">
                  {{ e.isRecurring ? (e.recurrenceType || 'Recurring') : 'One-time' }}
                </span>
              </td>
              <td class="text-danger font-bold">
                -{{ e.amount | currency: (authService.currentUser()?.currency ?? 'USD') }}
              </td>
              <td>
                <div class="row-actions">
                  <button class="btn btn-icon" (click)="editExpense(e)" title="Edit">
                    <span class="material-icons-round" style="font-size:16px">edit</span>
                  </button>
                  <button class="btn btn-icon" style="color:var(--color-danger)" (click)="deleteExpense(e)" title="Delete">
                    <span class="material-icons-round" style="font-size:16px">delete</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="empty-state" *ngIf="!loading() && expenses().length === 0">
          <span class="empty-state__icon">🧾</span>
          <p class="empty-state__title">No expenses found</p>
          <p class="empty-state__desc">Try adjusting your filters or add a new expense.</p>
          <button class="btn btn-primary btn-sm mt-md" (click)="openForm()">Add First Expense</button>
        </div>

        <!-- Pagination -->
        <div class="pagination" *ngIf="totalCount() > filter.pageSize!">
          <button class="btn btn-secondary btn-sm" [disabled]="filter.page === 1" (click)="prevPage()">
            <span class="material-icons-round" style="font-size:16px">chevron_left</span> Prev
          </button>
          <span class="text-sm text-muted">Page {{ filter.page }} of {{ totalPages() }}</span>
          <button class="btn btn-secondary btn-sm" [disabled]="filter.page! >= totalPages()" (click)="nextPage()">
            Next <span class="material-icons-round" style="font-size:16px">chevron_right</span>
          </button>
        </div>
      </div>

      <!-- Modal Form -->
      <div class="modal-backdrop" *ngIf="showForm()" (click)="closeForm()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ editMode() ? 'Edit' : 'Add' }} Expense</h3>
            <button class="btn btn-icon" (click)="closeForm()">
              <span class="material-icons-round">close</span>
            </button>
          </div>

          <form [formGroup]="form" (ngSubmit)="saveExpense()" class="modal-form">
            <div class="form-grid">
              <div class="form-group span-2">
                <label>Description *</label>
                <input type="text" formControlName="description" class="form-control" placeholder="Coffee, Groceries...">
              </div>
              <div class="form-group">
                <label>Amount *</label>
                <input type="number" formControlName="amount" class="form-control" placeholder="0.00" min="0" step="0.01">
              </div>
              <div class="form-group">
                <label>Date *</label>
                <input type="date" formControlName="date" class="form-control">
              </div>
              <div class="form-group">
                <label>Category</label>
                <select formControlName="categoryId" class="form-control">
                  <option value="">-- Select Category --</option>
                  <option *ngFor="let c of categories()" [value]="c.categoryId">{{ c.icon }} {{ c.name }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>Payment Mode</label>
                <select formControlName="paymentMode" class="form-control">
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="UPI">UPI</option>
                  <option value="BankTransfer">Bank Transfer</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div class="form-group span-2">
                <label class="checkbox-label">
                  <input type="checkbox" formControlName="isRecurring" class="checkbox">
                  Recurring expense
                </label>
              </div>
              <div class="form-group" *ngIf="form.value.isRecurring">
                <label>Recurrence *</label>
                <select formControlName="recurrenceType" class="form-control">
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Yearly">Yearly</option>
                </select>
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" (click)="closeForm()">Cancel</button>
              <button type="submit" class="btn btn-primary" [disabled]="form.invalid || saving()">
                {{ saving() ? 'Saving...' : (editMode() ? 'Update' : 'Add Expense') }}
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

    .filter-card { padding: var(--space-md); margin-bottom: var(--space-lg); }
    .filter-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr; gap: var(--space-sm); @media (max-width: 1024px) { grid-template-columns: 1fr 1fr; } @media (max-width: 600px) { grid-template-columns: 1fr; } }

    .table-card { padding: 0; overflow: hidden; }
    .p-lg { padding: var(--space-lg); }

    .expense-avatar { width: 28px; height: 28px; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

    .row-actions { display: flex; gap: 4px; opacity: 0; transition: opacity var(--transition-fast); }
    tr:hover .row-actions { opacity: 1; }

    .pagination { display: flex; align-items: center; justify-content: center; gap: var(--space-md); padding: var(--space-md); border-top: 1px solid var(--color-border); }

    .modal-form { display: flex; flex-direction: column; gap: var(--space-md); }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md); }
    .span-2 { grid-column: 1 / -1; }
    .modal-actions { display: flex; justify-content: flex-end; gap: var(--space-sm); margin-top: var(--space-sm); }
    .checkbox-label { display: flex; align-items: center; gap: 8px; font-size: 14px; color: var(--text-secondary); cursor: pointer; }
    .checkbox { width: 16px; height: 16px; accent-color: var(--color-primary); }
  `]
})
export class ExpenseListComponent implements OnInit {
  expenseService = inject(ExpenseService);
  categoryService = inject(CategoryService);
  toast = inject(ToastService);
  authService = inject(AuthService);
  private fb = inject(FormBuilder);

  expenses   = signal<Expense[]>([]);
  categories = signal<Category[]>([]);
  totalCount = signal(0);
  loading    = signal(true);
  showForm   = signal(false);
  editMode   = signal(false);
  saving     = signal(false);

  filter: ExpenseFilter = { page: 1, pageSize: 15 };
  editingId: string | null = null;

  form = this.fb.group({
    description: ['', Validators.required],
    amount:      [null as any, [Validators.required, Validators.min(0.01)]],
    date:        [new Date().toISOString().split('T')[0], Validators.required],
    categoryId:  [''],
    paymentMode: ['Cash'],
    isRecurring: [false],
    recurrenceType: ['Monthly']
  });

  ngOnInit(): void {
    this.loadExpenses();
    this.categoryService.getCategories().subscribe(c => this.categories.set(c));
  }

  loadExpenses(): void {
    this.loading.set(true);
    this.expenseService.getExpenses(this.filter).subscribe({
      next: res => { this.expenses.set(res.items); this.totalCount.set(res.totalCount); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  getExpenseCategoryName(expense: Expense): string {
    return expense.categoryName || this.categories().find(category => category.categoryId === expense.categoryId)?.name || 'Uncategorized';
  }

  getExpenseIcon(expense: Expense): string {
    return expense.categoryIcon || this.categories().find(category => category.categoryId === expense.categoryId)?.icon || 'receipt';
  }

  getExpenseColor(expense: Expense): string {
    const color = expense.categoryColor || this.categories().find(category => category.categoryId === expense.categoryId)?.color || '#6C63FF';
    return `${color}26`;
  }

  getExpenseAccent(expense: Expense): string {
    return expense.categoryColor || this.categories().find(category => category.categoryId === expense.categoryId)?.color || '#6C63FF';
  }

  totalPages(): number { return Math.ceil(this.totalCount() / this.filter.pageSize!); }
  prevPage(): void { this.filter.page!--; this.loadExpenses(); }
  nextPage(): void { this.filter.page!++; this.loadExpenses(); }

  onSearch(e: Event): void { this.filter.keyword = (e.target as HTMLInputElement).value; this.filter.page = 1; this.loadExpenses(); }
  onCategoryFilter(e: Event): void { this.filter.categoryId = (e.target as HTMLSelectElement).value || undefined; this.loadExpenses(); }
  onPaymentFilter(e: Event): void { this.filter.paymentMode = (e.target as HTMLSelectElement).value as any || undefined; this.loadExpenses(); }
  onDateFrom(e: Event): void { this.filter.startDate = (e.target as HTMLInputElement).value || undefined; this.loadExpenses(); }
  onDateTo(e: Event): void { this.filter.endDate = (e.target as HTMLInputElement).value || undefined; this.loadExpenses(); }

  openForm(): void { this.editMode.set(false); this.editingId = null; this.form.reset({ date: new Date().toISOString().split('T')[0], paymentMode: 'Cash', isRecurring: false, recurrenceType: 'Monthly' }); this.showForm.set(true); }
  closeForm(): void { this.showForm.set(false); }

  editExpense(e: Expense): void {
    this.editMode.set(true);
    this.editingId = e.expenseId;
    this.form.patchValue({ description: e.description, amount: e.amount, date: e.date.split('T')[0], categoryId: e.categoryId, paymentMode: e.paymentMode, isRecurring: e.isRecurring, recurrenceType: e.recurrenceType || 'Monthly' });
    this.showForm.set(true);
  }

  saveExpense(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const payload = { ...this.form.value, recurrenceType: this.form.value.isRecurring ? this.form.value.recurrenceType : null } as any;
    const obs = this.editMode() && this.editingId
      ? this.expenseService.updateExpense(this.editingId, payload)
      : this.expenseService.createExpense(payload);

    obs.subscribe({
      next: () => { this.toast.success(`Expense ${this.editMode() ? 'updated' : 'added'}!`); this.closeForm(); this.loadExpenses(); this.saving.set(false); },
      error: () => this.saving.set(false)
    });
  }

  deleteExpense(e: Expense): void {
    if (!confirm(`Delete "${e.description}"?`)) return;
    this.expenseService.deleteExpense(e.expenseId).subscribe({
      next: () => { this.toast.success('Expense deleted.'); this.loadExpenses(); }
    });
  }
}
