using Microsoft.EntityFrameworkCore;
using SpendSmart.Expense.API.Data;
using SpendSmart.Expense.API.Models;
using SpendSmart.Expense.API.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SpendSmart.Expense.API.Repositories;

public class ExpenseRepository : IExpenseRepository
{
    private readonly AppDbContext _context;

    public ExpenseRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Models.Expense>> GetAllExpensesAsync(int userId)
    {
        return await _context.Expenses
            .Where(e => e.UserId == userId && e.IsActive)
            .OrderByDescending(e => e.Date)
            .ToListAsync();
    }

    public async Task<Models.Expense?> GetExpenseByIdAsync(int expenseId)
    {
        return await _context.Expenses.FirstOrDefaultAsync(e => e.ExpenseId == expenseId && e.IsActive);
    }

    public async Task<List<Models.Expense>> GetExpensesByDateRangeAsync(int userId, DateTime startDate, DateTime endDate)
    {
        return await _context.Expenses
            .Where(e => e.UserId == userId && e.IsActive && e.Date >= startDate && e.Date <= endDate)
            .OrderByDescending(e => e.Date)
            .ToListAsync();
    }

    public async Task<List<Models.Expense>> GetExpensesByCategoryAsync(int userId, int categoryId)
    {
        return await _context.Expenses
            .Where(e => e.UserId == userId && e.CategoryId == categoryId && e.IsActive)
            .OrderByDescending(e => e.Date)
            .ToListAsync();
    }

    public async Task<Models.Expense> CreateExpenseAsync(Models.Expense expense)
    {
        _context.Expenses.Add(expense);
        await _context.SaveChangesAsync();
        return expense;
    }

    public async Task UpdateExpenseAsync(Models.Expense expense)
    {
        _context.Expenses.Update(expense);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteExpenseAsync(int expenseId)
    {
        var expense = await _context.Expenses.FirstOrDefaultAsync(e => e.ExpenseId == expenseId);
        if (expense != null)
        {
            expense.IsActive = false;
            await UpdateExpenseAsync(expense);
        }
    }
}
