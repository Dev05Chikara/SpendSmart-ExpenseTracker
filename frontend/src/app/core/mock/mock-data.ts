import { Expense, Income, Category, Budget, Notification, IncomeSummary, MonthlyReport, DashboardSummary, User } from '../models/models';

// ── Mock User ─────────────────────────────────────────────────
export const MOCK_USER: User = {
  userId: 'demo-user-001',
  name: 'Alex Johnson',
  email: 'alex@spendsmart.demo',
  role: 'User',
  currency: 'USD',
  avatarUrl: '',
  isActive: true,
  createdAt: '2025-01-01T00:00:00Z'
};

// ── Mock Categories ───────────────────────────────────────────
export const MOCK_CATEGORIES: Category[] = [
  { categoryId: 'cat-1', name: 'Food & Dining',    icon: '🍔', color: '#FF6B8A', type: 'Expense', isDefault: true,  isActive: true },
  { categoryId: 'cat-2', name: 'Transport',         icon: '🚗', color: '#4FACFE', type: 'Expense', isDefault: true,  isActive: true },
  { categoryId: 'cat-3', name: 'Housing',           icon: '🏠', color: '#FFB347', type: 'Expense', isDefault: true,  isActive: true },
  { categoryId: 'cat-4', name: 'Health',            icon: '💊', color: '#11D9C5', type: 'Expense', isDefault: true,  isActive: true },
  { categoryId: 'cat-5', name: 'Entertainment',     icon: '🎬', color: '#A18CD1', type: 'Expense', isDefault: true,  isActive: true },
  { categoryId: 'cat-6', name: 'Shopping',          icon: '🛍️', color: '#6C63FF', type: 'Expense', isDefault: true,  isActive: true },
  { categoryId: 'cat-7', name: 'Education',         icon: '📚', color: '#43E97B', type: 'Expense', isDefault: true,  isActive: true },
  { categoryId: 'cat-8', name: 'Savings',           icon: '💰', color: '#F953C6', type: 'Income',  isDefault: true,  isActive: true },
  { categoryId: 'cat-9', name: 'Freelance Work',    icon: '💻', color: '#30CFD0', type: 'Income',  isDefault: false, isActive: true },
  { categoryId: 'cat-10', name: 'Subscriptions',   icon: '📱', color: '#FA8231', type: 'Expense', isDefault: false, isActive: true },
];

// ── Mock Expenses ─────────────────────────────────────────────
export const MOCK_EXPENSES: Expense[] = [
  { expenseId: 'exp-1',  userId: 'demo-user-001', categoryId: 'cat-1', categoryName: 'Food & Dining',  categoryColor: '#FF6B8A', categoryIcon: '🍔', amount: 42.50,  date: '2026-05-05T10:00:00Z', description: 'Lunch at Olive Garden',    paymentMode: 'Card',        isRecurring: false },
  { expenseId: 'exp-2',  userId: 'demo-user-001', categoryId: 'cat-2', categoryName: 'Transport',      categoryColor: '#4FACFE', categoryIcon: '🚗', amount: 18.00,  date: '2026-05-04T08:30:00Z', description: 'Uber to office',          paymentMode: 'UPI',         isRecurring: false },
  { expenseId: 'exp-3',  userId: 'demo-user-001', categoryId: 'cat-10',categoryName: 'Subscriptions',  categoryColor: '#FA8231', categoryIcon: '📱', amount: 15.99,  date: '2026-05-03T12:00:00Z', description: 'Netflix Monthly',         paymentMode: 'Card',        isRecurring: true },
  { expenseId: 'exp-4',  userId: 'demo-user-001', categoryId: 'cat-5', categoryName: 'Entertainment',  categoryColor: '#A18CD1', categoryIcon: '🎬', amount: 29.00,  date: '2026-05-02T20:00:00Z', description: 'Movie tickets',           paymentMode: 'Cash',        isRecurring: false },
  { expenseId: 'exp-5',  userId: 'demo-user-001', categoryId: 'cat-6', categoryName: 'Shopping',       categoryColor: '#6C63FF', categoryIcon: '🛍️', amount: 89.99,  date: '2026-05-01T14:00:00Z', description: 'Nike sneakers',           paymentMode: 'Card',        isRecurring: false },
  { expenseId: 'exp-6',  userId: 'demo-user-001', categoryId: 'cat-3', categoryName: 'Housing',        categoryColor: '#FFB347', categoryIcon: '🏠', amount: 1200.00,date: '2026-05-01T09:00:00Z', description: 'Monthly rent',            paymentMode: 'BankTransfer',isRecurring: true },
  { expenseId: 'exp-7',  userId: 'demo-user-001', categoryId: 'cat-4', categoryName: 'Health',         categoryColor: '#11D9C5', categoryIcon: '💊', amount: 35.00,  date: '2026-04-30T11:00:00Z', description: 'Pharmacy',               paymentMode: 'Cash',        isRecurring: false },
  { expenseId: 'exp-8',  userId: 'demo-user-001', categoryId: 'cat-1', categoryName: 'Food & Dining',  categoryColor: '#FF6B8A', categoryIcon: '🍔', amount: 67.20,  date: '2026-04-29T19:30:00Z', description: 'Dinner with family',      paymentMode: 'Card',        isRecurring: false },
  { expenseId: 'exp-9',  userId: 'demo-user-001', categoryId: 'cat-7', categoryName: 'Education',      categoryColor: '#43E97B', categoryIcon: '📚', amount: 49.99,  date: '2026-04-28T10:00:00Z', description: 'Udemy course',            paymentMode: 'Card',        isRecurring: false },
  { expenseId: 'exp-10', userId: 'demo-user-001', categoryId: 'cat-2', categoryName: 'Transport',      categoryColor: '#4FACFE', categoryIcon: '🚗', amount: 55.00,  date: '2026-04-27T08:00:00Z', description: 'Monthly bus pass',        paymentMode: 'UPI',         isRecurring: true },
];

// ── Mock Income ───────────────────────────────────────────────
export const MOCK_INCOMES: Income[] = [
  { incomeId: 'inc-1', userId: 'demo-user-001', source: 'Salary',         amount: 5500.00, currency: 'USD', date: '2026-05-01T00:00:00Z', description: 'Monthly salary from TechCorp', isRecurring: true,  recurrenceType: 'Monthly' },
  { incomeId: 'inc-2', userId: 'demo-user-001', source: 'Freelance',      amount: 850.00,  currency: 'USD', date: '2026-05-03T00:00:00Z', description: 'Web design project',          isRecurring: false },
  { incomeId: 'inc-3', userId: 'demo-user-001', source: 'Investments',    amount: 320.50,  currency: 'USD', date: '2026-04-30T00:00:00Z', description: 'Dividend payout',             isRecurring: false },
  { incomeId: 'inc-4', userId: 'demo-user-001', source: 'Side Business',  amount: 450.00,  currency: 'USD', date: '2026-04-25T00:00:00Z', description: 'Online store sales',          isRecurring: false },
];

export const MOCK_INCOME_SUMMARY: IncomeSummary = {
  totalIncome:   7120.50,
  totalExpenses: 1602.67,
  netBalance:    5517.83,
  bySource: [
    { source: 'Salary',        amount: 5500.00 },
    { source: 'Freelance',     amount: 850.00  },
    { source: 'Investments',   amount: 320.50  },
    { source: 'Side Business', amount: 450.00  },
  ]
};

// ── Mock Budgets ──────────────────────────────────────────────
export const MOCK_BUDGETS: Budget[] = [
  { budgetId: 'bud-1', userId: 'demo-user-001', categoryId: 'cat-1', categoryName: 'Food & Dining', categoryColor: '#FF6B8A', categoryIcon: '🍔', limitAmount: 400,   spentAmount: 340,   period: 'Monthly', startDate: '2026-05-01T00:00:00Z', endDate: '2026-05-31T00:00:00Z', percentUsed: 85,  status: 'Warning'  },
  { budgetId: 'bud-2', userId: 'demo-user-001', categoryId: 'cat-2', categoryName: 'Transport',     categoryColor: '#4FACFE', categoryIcon: '🚗', limitAmount: 200,   spentAmount: 73,    period: 'Monthly', startDate: '2026-05-01T00:00:00Z', endDate: '2026-05-31T00:00:00Z', percentUsed: 36,  status: 'Safe'     },
  { budgetId: 'bud-3', userId: 'demo-user-001', categoryId: 'cat-3', categoryName: 'Housing',       categoryColor: '#FFB347', categoryIcon: '🏠', limitAmount: 1200,  spentAmount: 1200,  period: 'Monthly', startDate: '2026-05-01T00:00:00Z', endDate: '2026-05-31T00:00:00Z', percentUsed: 100, status: 'Breached' },
  { budgetId: 'bud-4', userId: 'demo-user-001', categoryId: 'cat-6', categoryName: 'Shopping',      categoryColor: '#6C63FF', categoryIcon: '🛍️', limitAmount: 300,   spentAmount: 89,    period: 'Monthly', startDate: '2026-05-01T00:00:00Z', endDate: '2026-05-31T00:00:00Z', percentUsed: 30,  status: 'Safe'     },
  { budgetId: 'bud-5', userId: 'demo-user-001', categoryId: 'cat-5', categoryName: 'Entertainment', categoryColor: '#A18CD1', categoryIcon: '🎬', limitAmount: 100,   spentAmount: 29,    period: 'Monthly', startDate: '2026-05-01T00:00:00Z', endDate: '2026-05-31T00:00:00Z', percentUsed: 29,  status: 'Safe'     },
];

// ── Mock Notifications ────────────────────────────────────────
export const MOCK_NOTIFICATIONS: Notification[] = [
  { notificationId: 'notif-1', userId: 'demo-user-001', type: 'BudgetBreached', title: 'Housing budget exceeded!',        message: 'Your Housing budget of $1,200 has been fully spent this month.',                  isRead: false, sentAt: '2026-05-05T09:00:00Z' },
  { notificationId: 'notif-2', userId: 'demo-user-001', type: 'BudgetAlert',    title: 'Food & Dining at 85%',            message: 'You have used 85% of your Food & Dining budget. $60 remaining.',                 isRead: false, sentAt: '2026-05-04T15:30:00Z' },
  { notificationId: 'notif-3', userId: 'demo-user-001', type: 'General',        title: 'Welcome to SpendSmart!',          message: 'Your account is set up. Start adding expenses to track your spending.',          isRead: true,  sentAt: '2026-05-01T08:00:00Z' },
  { notificationId: 'notif-4', userId: 'demo-user-001', type: 'BudgetAlert',    title: 'Netflix subscription renewed',   message: 'A recurring expense of $15.99 was recorded for Subscriptions.',                  isRead: true,  sentAt: '2026-05-03T12:01:00Z' },
];

// ── Mock Monthly Report ───────────────────────────────────────
export const MOCK_MONTHLY_REPORT: MonthlyReport = {
  year: 2026,
  month: 5,
  totalIncome:   7120.50,
  totalExpenses: 1602.67,
  netSavings:    5517.83,
  expensesByCategory: [
    { categoryName: 'Housing',       categoryColor: '#FFB347', amount: 1200.00, percentage: 74.9 },
    { categoryName: 'Food & Dining', categoryColor: '#FF6B8A', amount: 109.70,  percentage: 6.8  },
    { categoryName: 'Shopping',      categoryColor: '#6C63FF', amount: 89.99,   percentage: 5.6  },
    { categoryName: 'Entertainment', categoryColor: '#A18CD1', amount: 29.00,   percentage: 1.8  },
    { categoryName: 'Transport',     categoryColor: '#4FACFE', amount: 73.00,   percentage: 4.6  },
    { categoryName: 'Health',        categoryColor: '#11D9C5', amount: 35.00,   percentage: 2.2  },
    { categoryName: 'Subscriptions', categoryColor: '#FA8231', amount: 65.99,   percentage: 4.1  },
  ],
  dailyExpenses: [
    { date: '2026-05-01', amount: 1289.99 },
    { date: '2026-05-02', amount: 29.00   },
    { date: '2026-05-03', amount: 15.99   },
    { date: '2026-05-04', amount: 18.00   },
    { date: '2026-05-05', amount: 42.50   },
    { date: '2026-05-06', amount: 0       },
    { date: '2026-05-07', amount: 0       },
  ]
};

// ── Mock Admin Users ──────────────────────────────────────────
export const MOCK_ADMIN_USERS: User[] = [
  { userId: 'demo-user-001', name: 'Alex Johnson',   email: 'alex@spendsmart.demo',   role: 'User',  currency: 'USD', isActive: true  },
  { userId: 'demo-user-002', name: 'Sarah Williams', email: 'sarah@spendsmart.demo',  role: 'Admin', currency: 'USD', isActive: true  },
  { userId: 'demo-user-003', name: 'Mike Chen',      email: 'mike@spendsmart.demo',   role: 'User',  currency: 'EUR', isActive: true  },
  { userId: 'demo-user-004', name: 'Priya Patel',    email: 'priya@spendsmart.demo',  role: 'User',  currency: 'INR', isActive: false },
  { userId: 'demo-user-005', name: 'Carlos Rivera',  email: 'carlos@spendsmart.demo', role: 'User',  currency: 'USD', isActive: true  },
];
