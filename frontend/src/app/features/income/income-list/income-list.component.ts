import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { IncomeService } from '../../../core/services/income.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';
import { Income, IncomeSummary } from '../../../core/models/models';

@Component({
  selector: 'app-income-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe, DatePipe],
  template: `
    <div class="page-enter">
      <div class="page-header-row">
        <div>
          <h2 class="page-title-text">Income</h2>
          <p class="text-muted text-sm">Manage all your income sources</p>
        </div>
        <button class="btn btn-success" (click)="openForm()">
          <span class="material-icons-round" style="font-size:18px">add</span>
          Add Income
        </button>
      </div>

      <!-- Summary Cards -->
      <div class="income-summary" *ngIf="summary()">
        <div class="stat-card">
          <div class="stat-card__icon" style="background: rgba(17,217,197,0.15); color: var(--color-success)">
            <span class="material-icons-round">trending_up</span>
          </div>
          <div>
            <p class="stat-card__label">Total Income</p>
            <p class="stat-card__value text-success">{{ summary()!.totalIncome | currency: (authService.currentUser()?.currency ?? 'USD') }}</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-card__icon" style="background: rgba(255,107,138,0.15); color: var(--color-danger)">
            <span class="material-icons-round">trending_down</span>
          </div>
          <div>
            <p class="stat-card__label">Total Expenses</p>
            <p class="stat-card__value text-danger">{{ summary()!.totalExpenses | currency: (authService.currentUser()?.currency ?? 'USD') }}</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-card__icon" style="background: rgba(108,99,255,0.15); color: var(--color-primary-light)">
            <span class="material-icons-round">savings</span>
          </div>
          <div>
            <p class="stat-card__label">Net Balance</p>
            <p class="stat-card__value"
               [class.text-success]="summary()!.netBalance >= 0"
               [class.text-danger]="summary()!.netBalance < 0">
              {{ summary()!.netBalance | currency: (authService.currentUser()?.currency ?? 'USD') }}
            </p>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="glass-card table-card">
        <table class="ss-table" *ngIf="incomes().length > 0">
          <thead>
            <tr>
              <th>Source</th>
              <th>Description</th>
              <th>Date</th>
              <th>Currency</th>
              <th>Recurring</th>
              <th>Amount</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let i of incomes()">
              <td>
                <div class="d-flex align-center gap-sm">
                  <div class="source-dot"></div>
                  <span class="font-medium">{{ i.source }}</span>
                </div>
              </td>
              <td class="text-muted text-sm">{{ i.description || '—' }}</td>
              <td class="text-muted text-sm">{{ i.date | date:'MMM d, yyyy' }}</td>
              <td><span class="badge badge-muted">{{ getUserCurrency() }}</span></td>
              <td>
                <span class="badge" [class.badge-primary]="i.isRecurring" [class.badge-muted]="!i.isRecurring">
                  {{ i.isRecurring ? i.recurrenceType || 'Recurring' : 'One-time' }}
                </span>
              </td>
              <td class="text-success font-bold">+{{ i.amount | currency: (authService.currentUser()?.currency ?? 'USD') }}</td>
              <td>
                <div class="row-actions">
                  <button class="btn btn-icon" (click)="editIncome(i)"><span class="material-icons-round" style="font-size:16px">edit</span></button>
                  <button class="btn btn-icon" style="color:var(--color-danger)" (click)="deleteIncome(i)"><span class="material-icons-round" style="font-size:16px">delete</span></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="empty-state" *ngIf="incomes().length === 0 && !loading()">
          <span class="empty-state__icon">💵</span>
          <p class="empty-state__title">No income records</p>
          <p class="empty-state__desc">Add your first income source to get started.</p>
          <button class="btn btn-success btn-sm mt-md" (click)="openForm()">Add Income</button>
        </div>
      </div>

      <!-- Modal -->
      <div class="modal-backdrop" *ngIf="showForm()" (click)="closeForm()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ editMode() ? 'Edit' : 'Add' }} Income</h3>
            <button class="btn btn-icon" (click)="closeForm()"><span class="material-icons-round">close</span></button>
          </div>
          <form [formGroup]="form" (ngSubmit)="save()" class="modal-form">
            <div class="form-grid">
              <div class="form-group">
                <label>Source *</label>
                <input type="text" formControlName="source" class="form-control" placeholder="Salary, Freelance...">
              </div>
              <div class="form-group">
                <label>Amount *</label>
                <input type="number" formControlName="amount" class="form-control" placeholder="0.00">
              </div>
              <div class="form-group">
                <label>Date *</label>
                <input type="date" formControlName="date" class="form-control">
              </div>
              <div class="form-group">
                <label>Currency</label>
                <div class="locked-field">
                  <span class="badge badge-primary">{{ getUserCurrency() }}</span>
                  <span class="text-muted text-xs">Inherited from your profile</span>
                </div>
              </div>
              <div class="form-group span-2">
                <label>Description *</label>
                <input type="text" formControlName="description" class="form-control" placeholder="Enter a description...">
              </div>
              <div class="form-group">
                <label class="checkbox-label">
                  <input type="checkbox" formControlName="isRecurring" class="checkbox">
                  Recurring income
                </label>
              </div>
              <div class="form-group" *ngIf="form.value.isRecurring">
                <label>Recurrence</label>
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
              <button type="submit" class="btn btn-success" [disabled]="form.invalid || saving()">
                {{ saving() ? 'Saving...' : (editMode() ? 'Update' : 'Add Income') }}
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
    .income-summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-md); margin-bottom: var(--space-xl); @media (max-width: 768px) { grid-template-columns: 1fr; } }
    .stat-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; backdrop-filter: blur(16px); padding: var(--space-lg); display: flex; align-items: center; gap: var(--space-md); }
    .stat-card__icon { width: 48px; height: 48px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; flex-shrink: 0; .material-icons-round { font-size: 24px; } }
    .stat-card__label { font-size: 12px; color: var(--text-secondary); font-weight: 500; margin-bottom: 4px; }
    .stat-card__value { font-size: 22px; font-weight: 700; }
    .table-card { padding: 0; overflow: hidden; }
    .source-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--gradient-success); flex-shrink: 0; }
    .row-actions { display: flex; gap: 4px; opacity: 0; transition: opacity var(--transition-fast); }
    tr:hover .row-actions { opacity: 1; }
    .modal-form { display: flex; flex-direction: column; gap: var(--space-md); }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md); }
    .span-2 { grid-column: 1 / -1; }
    .modal-actions { display: flex; justify-content: flex-end; gap: var(--space-sm); margin-top: var(--space-sm); }
    .checkbox-label { display: flex; align-items: center; gap: 8px; font-size: 14px; color: var(--text-secondary); cursor: pointer; }
    .checkbox { width: 16px; height: 16px; accent-color: var(--color-primary); }
    .locked-field { display: flex; align-items: center; gap: 10px; padding: 11px 14px; min-height: 44px; background: rgba(255,255,255,0.04); border: 1px solid var(--color-border); border-radius: var(--radius-md); }
  `]
})
export class IncomeListComponent implements OnInit {
  incomeService = inject(IncomeService);
  toast         = inject(ToastService);
  authService   = inject(AuthService);
  private fb    = inject(FormBuilder);

  incomes   = signal<Income[]>([]);
  summary   = signal<IncomeSummary | null>(null);
  loading   = signal(true);
  showForm  = signal(false);
  editMode  = signal(false);
  saving    = signal(false);
  editingId: string | null = null;

  form = this.fb.group({
    source:         ['', Validators.required],
    amount:         [null as any, [Validators.required, Validators.min(0.01)]],
    date:           [new Date().toISOString().split('T')[0], Validators.required],
    description:    ['', Validators.required],
    isRecurring:    [false],
    recurrenceType: ['Monthly']
  });

  ngOnInit(): void {
    this.load();
    this.incomeService.getSummary().subscribe(s => this.summary.set(s));
  }

  load(): void {
    this.loading.set(true);
    this.incomeService.getIncomes().subscribe({
      next: res => { this.incomes.set(res.items); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  openForm(): void { this.editMode.set(false); this.editingId = null; this.form.reset({ date: new Date().toISOString().split('T')[0], isRecurring: false, recurrenceType: 'Monthly' }); this.showForm.set(true); }
  closeForm(): void { this.showForm.set(false); }

  editIncome(i: Income): void {
    this.editMode.set(true); this.editingId = i.incomeId;
    this.form.patchValue({ source: i.source, amount: i.amount, date: i.date.split('T')[0], description: i.description, isRecurring: i.isRecurring, recurrenceType: i.recurrenceType || 'Monthly' });
    this.showForm.set(true);
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const payload = { ...this.form.value, recurrenceType: this.form.value.isRecurring ? this.form.value.recurrenceType : null } as any;
    const obs = this.editMode() && this.editingId
      ? this.incomeService.updateIncome(this.editingId, payload)
      : this.incomeService.createIncome(payload);
    obs.subscribe({ next: () => { this.toast.success('Income saved!'); this.closeForm(); this.load(); this.saving.set(false); }, error: () => this.saving.set(false) });
  }

  deleteIncome(i: Income): void {
    if (!confirm(`Delete income "${i.source}"?`)) return;
    this.incomeService.deleteIncome(i.incomeId).subscribe({ next: () => { this.toast.success('Deleted.'); this.load(); } });
  }

  getUserCurrency(): string {
    return this.authService.currentUser()?.currency ?? 'USD';
  }
}
