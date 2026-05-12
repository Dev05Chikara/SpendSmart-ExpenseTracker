import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CategoryService } from '../../../core/services/category.service';
import { ToastService } from '../../../core/services/toast.service';
import { Category } from '../../../core/models/models';

const PRESET_COLORS = ['#6C63FF','#FF6B8A','#11D9C5','#FFB347','#4FACFE','#A18CD1','#43E97B','#F953C6','#30CFD0','#FA8231'];
const PRESET_ICONS  = ['🍔','🚗','🏠','💊','🎬','🛍️','📚','💰','✈️','⚡','💪','🎮','🎵','📱','💻','🐕','👗','☕','🍕','🎂'];

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page-enter">
      <div class="page-header-row">
        <div>
          <h2 class="page-title-text">Categories</h2>
          <p class="text-muted text-sm">Organize expenses and income by category</p>
        </div>
        <button class="btn btn-primary" (click)="openForm()">
          <span class="material-icons-round" style="font-size:18px">add</span>
          New Category
        </button>
      </div>

      <!-- Category Grid -->
      <div class="cat-grid" *ngIf="!loading()">
        <div *ngFor="let c of categories()"
             class="glass-card cat-card"
             [class.inactive]="!c.isActive">
          <div class="cat-card__top">
            <div class="cat-icon" [style.background]="c.color + '26'">
              <span style="font-size:24px">{{ c.icon }}</span>
            </div>
            <div class="cat-actions" *ngIf="!c.isDefault">
              <button class="btn btn-icon" (click)="editCat(c)"><span class="material-icons-round" style="font-size:15px">edit</span></button>
              <button class="btn btn-icon" style="color:var(--color-danger)" (click)="deleteCat(c)"><span class="material-icons-round" style="font-size:15px">delete</span></button>
            </div>
            <span class="badge badge-muted" *ngIf="c.isDefault" style="margin-left:auto">Default</span>
          </div>
          <p class="cat-name">{{ c.name }}</p>
          <div class="cat-meta">
            <span class="badge" [class.badge-primary]="c.type === 'Expense'" [class.badge-success]="c.type === 'Income'" [class.badge-info]="c.type === 'Both'">{{ c.type }}</span>
            <div class="color-dot" [style.background]="c.color"></div>
          </div>
        </div>

        <!-- Add Placeholder -->
        <div class="glass-card cat-card cat-add-card" (click)="openForm()">
          <span class="material-icons-round" style="font-size:36px;color:var(--text-muted)">add_circle_outline</span>
          <p class="text-muted text-sm">Add Category</p>
        </div>
      </div>

      <div class="skeleton-grid" *ngIf="loading()">
        <div class="skeleton skeleton-card" *ngFor="let i of [1,2,3,4,5,6]" style="height:140px"></div>
      </div>

      <!-- Modal -->
      <div class="modal-backdrop" *ngIf="showForm()" (click)="closeForm()">
        <div class="modal" style="min-width:480px" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ editMode() ? 'Edit' : 'New' }} Category</h3>
            <button class="btn btn-icon" (click)="closeForm()"><span class="material-icons-round">close</span></button>
          </div>
          <form [formGroup]="form" (ngSubmit)="save()" class="modal-form">
            <div class="form-group">
              <label>Name *</label>
              <input type="text" formControlName="name" class="form-control" placeholder="Category name">
            </div>

            <div class="form-group">
              <label>Icon</label>
              <div class="icon-picker">
                <button *ngFor="let ic of presetIcons" type="button"
                        class="icon-btn" [class.selected]="form.value.icon === ic"
                        (click)="form.patchValue({icon: ic})">{{ ic }}</button>
              </div>
              <div class="d-flex align-center gap-sm mt-sm">
                <span style="font-size:14px;color:var(--text-muted)">Selected:</span>
                <span style="font-size:22px">{{ form.value.icon || '❓' }}</span>
                <input type="text" formControlName="icon" class="form-control" style="max-width:80px" placeholder="Emoji">
              </div>
            </div>

            <div class="form-group">
              <label>Color</label>
              <div class="color-picker">
                <button *ngFor="let col of presetColors" type="button"
                        class="color-btn" [style.background]="col"
                        [class.selected]="form.value.color === col"
                        (click)="form.patchValue({color: col})">
                  <span class="material-icons-round" style="font-size:14px;color:#fff" *ngIf="form.value.color === col">check</span>
                </button>
              </div>
            </div>

            <div class="form-group">
              <label>Type</label>
              <div class="type-tabs">
                <button *ngFor="let t of ['Expense','Income','Both']" type="button"
                        class="chip" [class.active]="form.value.type === t"
                        (click)="form.patchValue({type: t})">{{ t }}</button>
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" (click)="closeForm()">Cancel</button>
              <button type="submit" class="btn btn-primary" [disabled]="form.invalid || saving()">
                {{ saving() ? 'Saving...' : (editMode() ? 'Update' : 'Create') }}
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

    .cat-grid, .skeleton-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: var(--space-md); }

    .cat-card {
      padding: var(--space-lg);
      display: flex; flex-direction: column; gap: 10px;
      transition: transform var(--transition-base);
      &:hover { transform: translateY(-4px); }
      &.inactive { opacity: 0.5; }
    }

    .cat-card__top { display: flex; align-items: flex-start; }
    .cat-icon { width: 52px; height: 52px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; }
    .cat-actions { display: flex; gap: 4px; margin-left: auto; opacity: 0; transition: opacity var(--transition-fast); }
    .cat-card:hover .cat-actions { opacity: 1; }
    .cat-name { font-size: 15px; font-weight: 600; }
    .cat-meta { display: flex; align-items: center; justify-content: space-between; }
    .color-dot { width: 12px; height: 12px; border-radius: 50%; }

    .cat-add-card { align-items: center; justify-content: center; cursor: pointer; border: 2px dashed var(--color-border); background: transparent; &:hover { border-color: var(--color-primary); background: rgba(108,99,255,0.05); } }

    .modal-form { display: flex; flex-direction: column; gap: var(--space-md); }
    .modal-actions { display: flex; justify-content: flex-end; gap: var(--space-sm); }

    .icon-picker { display: flex; flex-wrap: wrap; gap: 6px; }
    .icon-btn { width: 38px; height: 38px; border-radius: var(--radius-sm); font-size: 18px; background: var(--color-surface); border: 1px solid var(--color-border); cursor: pointer; transition: all var(--transition-fast); display: flex; align-items: center; justify-content: center; &:hover { border-color: var(--color-primary); } &.selected { border-color: var(--color-primary); background: rgba(108,99,255,0.15); } }

    .color-picker { display: flex; flex-wrap: wrap; gap: 8px; }
    .color-btn { width: 30px; height: 30px; border-radius: 50%; cursor: pointer; border: 2px solid transparent; display: flex; align-items: center; justify-content: center; transition: border-color var(--transition-fast); &.selected { border-color: #fff; } }

    .type-tabs { display: flex; gap: var(--space-sm); }
  `]
})
export class CategoryListComponent implements OnInit {
  categoryService = inject(CategoryService);
  toast = inject(ToastService);
  private fb = inject(FormBuilder);

  categories  = signal<Category[]>([]);
  loading     = signal(true);
  showForm    = signal(false);
  editMode    = signal(false);
  saving      = signal(false);
  editingId: string | null = null;

  presetColors = PRESET_COLORS;
  presetIcons  = PRESET_ICONS;

  form = this.fb.group({
    name:  ['', Validators.required],
    icon:  ['🛍️'],
    color: ['#6C63FF'],
    type:  ['Expense']
  });

  ngOnInit(): void { this.load(); }

  load(): void {
    this.categoryService.getCategories().subscribe({ next: c => { this.categories.set(c); this.loading.set(false); }, error: () => this.loading.set(false) });
  }

  openForm(): void { this.editMode.set(false); this.editingId = null; this.form.reset({ icon: '🛍️', color: '#6C63FF', type: 'Expense' }); this.showForm.set(true); }
  closeForm(): void { this.showForm.set(false); }

  editCat(c: Category): void {
    this.editMode.set(true); this.editingId = c.categoryId;
    this.form.patchValue({ name: c.name, icon: c.icon, color: c.color, type: c.type });
    this.showForm.set(true);
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const obs = this.editMode() && this.editingId
      ? this.categoryService.updateCategory(this.editingId, this.form.value as any)
      : this.categoryService.createCategory(this.form.value as any);
    obs.subscribe({ next: () => { this.toast.success('Category saved!'); this.closeForm(); this.load(); this.saving.set(false); }, error: () => this.saving.set(false) });
  }

  deleteCat(c: Category): void {
    if (!confirm(`Delete category "${c.name}"?`)) return;
    this.categoryService.deleteCategory(c.categoryId).subscribe({ next: () => { this.toast.success('Deleted.'); this.load(); } });
  }
}
