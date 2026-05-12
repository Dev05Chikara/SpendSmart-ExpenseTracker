// ── Auth Models ──────────────────────────────────────────────
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  currency?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface User {
  userId: string;
  name: string;
  email: string;
  role: 'User' | 'Admin';
  currency: string;
  avatarUrl?: string;
  isActive: boolean;
  createdAt?: string;
}

// ── Expense Models ───────────────────────────────────────────
export interface Expense {
  expenseId: string;
  userId: string;
  categoryId: string;
  categoryName?: string;
  categoryColor?: string;
  categoryIcon?: string;
  amount: number;
  date: string;
  description: string;
  paymentMode: PaymentMode;
  receiptUrl?: string;
  isRecurring: boolean;
  recurrenceType?: ExpenseRecurrenceType;
}

export type ExpenseRecurrenceType = 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';

export type PaymentMode = 'Cash' | 'Card' | 'UPI' | 'BankTransfer' | 'Other';

export interface ExpenseFilter {
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  paymentMode?: PaymentMode;
  keyword?: string;
  page?: number;
  pageSize?: number;
}

// ── Income Models ─────────────────────────────────────────────
export interface Income {
  incomeId: string;
  userId: string;
  source: string;
  amount: number;
  currency: string;
  date: string;
  description: string;
  isRecurring: boolean;
  recurrenceType?: 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';
}

export interface IncomeSummary {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  bySource: { source: string; amount: number }[];
}

// ── Category Models ───────────────────────────────────────────
export interface Category {
  categoryId: string;
  userId?: string;
  name: string;
  icon: string;
  color: string;
  type: 'Expense' | 'Income' | 'Both';
  isDefault: boolean;
  isActive: boolean;
}

// ── Budget Models ─────────────────────────────────────────────
export interface Budget {
  budgetId: string;
  userId: string;
  categoryId: string;
  categoryName?: string;
  categoryColor?: string;
  categoryIcon?: string;
  limitAmount: number;
  spentAmount: number;
  period: 'Monthly' | 'Weekly' | 'Yearly';
  startDate: string;
  endDate: string;
  percentUsed?: number;
  status?: 'Safe' | 'Warning' | 'Breached';
}

// ── Report Models ─────────────────────────────────────────────
export interface MonthlyReport {
  year: number;
  month: number;
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  expensesByCategory: CategoryBreakdown[];
  dailyExpenses: DailyExpense[];
}

export interface CategoryBreakdown {
  categoryName: string;
  categoryColor: string;
  amount: number;
  percentage: number;
}

export interface DailyExpense {
  date: string;
  amount: number;
}

export interface YearlyReport {
  year: number;
  months: { month: number; income: number; expenses: number }[];
  totalIncome: number;
  totalExpenses: number;
}

// ── Notification Models ───────────────────────────────────────
export interface Notification {
  notificationId: string;
  userId: string;
  type: 'BudgetAlert' | 'BudgetBreached' | 'General';
  title: string;
  message: string;
  relatedId?: string;
  isRead: boolean;
  sentAt: string;
}

// ── Shared ────────────────────────────────────────────────────
export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

export interface DashboardSummary {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySavings: number;
  budgetAlerts: number;
  recentExpenses: Expense[];
  topCategories: CategoryBreakdown[];
  weeklyTrend: { day: string; amount: number }[];
}
