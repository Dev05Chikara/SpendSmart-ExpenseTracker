import { Budget, Category, Expense, Income, Notification, User } from '../models/models';

export function unwrapData<T>(response: any): T {
  if (response && typeof response === 'object' && 'data' in response) {
    return response.data as T;
  }

  if (response && typeof response === 'object' && 'Data' in response) {
    return response.Data as T;
  }

  return response as T;
}

export function mapUser(response: any): User {
  return {
    userId: String(response?.userId ?? response?.UserId ?? ''),
    name: response?.name ?? response?.fullName ?? response?.FullName ?? '',
    email: response?.email ?? response?.Email ?? '',
    role: response?.role ?? response?.Role ?? 'User',
    currency: response?.currency ?? response?.Currency ?? 'USD',
    avatarUrl: response?.avatarUrl ?? response?.AvatarUrl ?? '',
    isActive: response?.isActive ?? response?.IsActive ?? true,
    createdAt: response?.createdAt ?? response?.CreatedAt,
  };
}

export function mapAuthResponse(response: any): { token: string; user: User } {
  const payload = unwrapData<any>(response);
  return {
    token: payload?.token ?? payload?.Token ?? '',
    user: mapUser(payload?.user ?? payload?.User ?? payload),
  };
}

export function mapExpense(response: any): Expense {
  return {
    expenseId: String(response?.expenseId ?? response?.ExpenseId ?? ''),
    userId: String(response?.userId ?? response?.UserId ?? ''),
    categoryId: String(response?.categoryId ?? response?.CategoryId ?? ''),
    categoryName: response?.categoryName ?? response?.CategoryName,
    categoryColor: response?.categoryColor ?? response?.CategoryColor,
    categoryIcon: response?.categoryIcon ?? response?.CategoryIcon,
    amount: Number(response?.amount ?? response?.Amount ?? 0),
    date: response?.date ?? response?.Date ?? new Date().toISOString(),
    description: response?.description ?? response?.Description ?? '',
    paymentMode: response?.paymentMode ?? response?.PaymentMode ?? 'Other',
    receiptUrl: response?.receiptUrl ?? response?.ReceiptUrl,
    isRecurring: Boolean(response?.isRecurring ?? response?.IsRecurring),
    recurrenceType: response?.recurrenceType ?? response?.RecurrenceType,
  };
}

export function mapCategory(response: any): Category {
  const userIdValue = response?.userId ?? response?.UserId;

  return {
    categoryId: String(response?.categoryId ?? response?.CategoryId ?? ''),
    userId: userIdValue != null ? String(userIdValue) : undefined,
    name: response?.name ?? response?.Name ?? '',
    icon: response?.icon ?? response?.Icon ?? '💰',
    color: response?.color ?? response?.Color ?? '#6C63FF',
    type: response?.type ?? response?.Type ?? 'Expense',
    isDefault: Boolean(response?.isDefault ?? response?.IsDefault),
    isActive: Boolean(response?.isActive ?? response?.IsActive ?? true),
  };
}

export function mapBudget(response: any): Budget {
  const spentAmount = Number(response?.spentAmount ?? response?.SpentAmount ?? 0);
  const limitAmount = Number(response?.limitAmount ?? response?.LimitAmount ?? 0);
  const percentUsed = Number(response?.percentUsed ?? response?.UsagePercentage ?? (limitAmount > 0 ? (spentAmount / limitAmount) * 100 : 0));

  return {
    budgetId: String(response?.budgetId ?? response?.BudgetId ?? ''),
    userId: String(response?.userId ?? response?.UserId ?? ''),
    categoryId: String(response?.categoryId ?? response?.CategoryId ?? ''),
    categoryName: response?.categoryName ?? response?.CategoryName,
    categoryColor: response?.categoryColor ?? response?.CategoryColor,
    categoryIcon: response?.categoryIcon ?? response?.CategoryIcon,
    limitAmount,
    spentAmount,
    period: response?.period ?? response?.Period ?? 'Monthly',
    startDate: response?.startDate ?? response?.StartDate ?? new Date().toISOString(),
    endDate: response?.endDate ?? response?.EndDate ?? new Date().toISOString(),
    percentUsed,
    status: response?.status ?? response?.Status ?? (percentUsed >= 100 ? 'Breached' : percentUsed >= 80 ? 'Warning' : 'Safe'),
  };
}

export function mapIncome(response: any): Income {
  return {
    incomeId: String(response?.incomeId ?? response?.IncomeId ?? ''),
    userId: String(response?.userId ?? response?.UserId ?? ''),
    source: response?.source ?? response?.Source ?? '',
    amount: Number(response?.amount ?? response?.Amount ?? 0),
    currency: response?.currency ?? response?.Currency ?? 'USD',
    date: response?.date ?? response?.Date ?? new Date().toISOString(),
    description: response?.description ?? response?.Description ?? '',
    isRecurring: Boolean(response?.isRecurring ?? response?.IsRecurring),
    recurrenceType: response?.recurrenceType ?? response?.RecurrenceType,
  };
}

export function mapNotification(response: any): Notification {
  return {
    notificationId: String(response?.notificationId ?? response?.NotificationId ?? ''),
    userId: String(response?.userId ?? response?.UserId ?? ''),
    type: response?.type ?? response?.Type ?? 'General',
    title: response?.title ?? response?.Title ?? '',
    message: response?.message ?? response?.Message ?? '',
    relatedId: response?.relatedId ?? response?.RelatedId,
    isRead: Boolean(response?.isRead ?? response?.IsRead),
    sentAt: response?.sentAt ?? response?.CreatedAt ?? response?.SentAt ?? new Date().toISOString(),
  };
}
