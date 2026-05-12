using SpendSmart.Expense.API.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SpendSmart.Expense.API.Repositories.Interfaces;

public interface IExpenseRepository
{
    Task<List<Models.Expense>> GetAllExpensesAsync(int userId);
    Task<Models.Expense?> GetExpenseByIdAsync(int expenseId);
    Task<List<Models.Expense>> GetExpensesByDateRangeAsync(int userId, DateTime startDate, DateTime endDate);
    Task<List<Models.Expense>> GetExpensesByCategoryAsync(int userId, int categoryId);
    Task<Models.Expense> CreateExpenseAsync(Models.Expense expense);
    Task UpdateExpenseAsync(Models.Expense expense);
    Task DeleteExpenseAsync(int expenseId);
}
