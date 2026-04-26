using SpendSmart.Expense.API.DTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SpendSmart.Expense.API.Services.Interfaces;

public interface IExpenseService
{
    Task<List<ExpenseResponse>> GetAllExpensesAsync(int userId);
    Task<ExpenseResponse> GetExpenseByIdAsync(int expenseId);
    Task<List<ExpenseResponse>> GetExpensesByDateRangeAsync(int userId, DateTime startDate, DateTime endDate);
    Task<List<ExpenseResponse>> GetExpensesByCategoryAsync(int userId, int categoryId);
    Task<ExpenseResponse> CreateExpenseAsync(int userId, ExpenseRequest request);
    Task<ExpenseResponse> UpdateExpenseAsync(int expenseId, int userId, ExpenseRequest request);
    Task DeleteExpenseAsync(int expenseId);
}
