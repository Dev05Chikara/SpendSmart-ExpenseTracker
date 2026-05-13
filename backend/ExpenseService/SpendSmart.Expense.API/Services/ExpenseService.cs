using SpendSmart.Expense.API.DTOs;
using SpendSmart.Expense.API.Models;
using SpendSmart.Expense.API.Repositories.Interfaces;
using SpendSmart.Expense.API.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SpendSmart.Expense.API.Services;

public class ExpenseService : IExpenseService
{
    private readonly IExpenseRepository _repository;

    public ExpenseService(IExpenseRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<ExpenseResponse>> GetAllExpensesAsync(int userId)
    {
        var expenses = await _repository.GetAllExpensesAsync(userId);
        return expenses.Select(e => MapToResponse(e)).ToList();
    }

    public async Task<ExpenseResponse> GetExpenseByIdAsync(int expenseId)
    {
        var expense = await _repository.GetExpenseByIdAsync(expenseId);
        if (expense == null)
            throw new InvalidOperationException("Expense not found.");
        return MapToResponse(expense);
    }

    public async Task<List<ExpenseResponse>> GetExpensesByDateRangeAsync(int userId, DateTime startDate, DateTime endDate)
    {
        var expenses = await _repository.GetExpensesByDateRangeAsync(userId, startDate, endDate);
        return expenses.Select(e => MapToResponse(e)).ToList();
    }

    public async Task<List<ExpenseResponse>> GetExpensesByCategoryAsync(int userId, int categoryId)
    {
        var expenses = await _repository.GetExpensesByCategoryAsync(userId, categoryId);
        return expenses.Select(e => MapToResponse(e)).ToList();
    }

    public async Task<ExpenseResponse> CreateExpenseAsync(int userId, ExpenseRequest request)
    {
        var expense = new Models.Expense
        {
            UserId = userId,
            CategoryId = request.CategoryId,
            Amount = request.Amount,
            Date = request.Date,
            Description = request.Description,
            PaymentMode = request.PaymentMode,
            IsRecurring = request.IsRecurring,
            RecurrenceType = request.RecurrenceType,
            NextDueDate = request.IsRecurring ? CalculateNextDueDate(request.Date, request.RecurrenceType) : null,
            IsActive = true
        };

        var created = await _repository.CreateExpenseAsync(expense);
        return MapToResponse(created);
    }

    public async Task<ExpenseResponse> UpdateExpenseAsync(int expenseId, int userId, ExpenseRequest request)
    {
        var expense = await _repository.GetExpenseByIdAsync(expenseId);
        if (expense == null)
            throw new InvalidOperationException("Expense not found.");

        if (expense.UserId != userId)
            throw new UnauthorizedAccessException("You do not have permission to update this expense.");

        expense.CategoryId = request.CategoryId;
        expense.Amount = request.Amount;
        expense.Date = request.Date;
        expense.Description = request.Description;
        expense.PaymentMode = request.PaymentMode;
        expense.IsRecurring = request.IsRecurring;
        expense.RecurrenceType = request.RecurrenceType;
        expense.NextDueDate = request.IsRecurring ? CalculateNextDueDate(request.Date, request.RecurrenceType) : null;

        await _repository.UpdateExpenseAsync(expense);
        return MapToResponse(expense);
    }

    public async Task DeleteExpenseAsync(int expenseId)
    {
        await _repository.DeleteExpenseAsync(expenseId);
    }

    private static ExpenseResponse MapToResponse(Models.Expense expense)
    {
        return new ExpenseResponse
        {
            ExpenseId = expense.ExpenseId,
            UserId = expense.UserId,
            CategoryId = expense.CategoryId,
            Amount = expense.Amount,
            Date = expense.Date,
            Description = expense.Description,
            PaymentMode = expense.PaymentMode,
            ReceiptUrl = expense.ReceiptUrl,
            IsRecurring = expense.IsRecurring,
            RecurrenceType = expense.RecurrenceType,
            IsActive = expense.IsActive
        };
    }

    public static DateTime? CalculateNextDueDate(DateTime date, string? recurrenceType)
    {
        if (string.IsNullOrEmpty(recurrenceType)) return null;

        return recurrenceType.ToLower() switch
        {
            "daily" => date.AddDays(1),
            "weekly" => date.AddDays(7),
            "monthly" => date.AddMonths(1),
            "yearly" => date.AddYears(1),
            _ => null
        };
    }
}
