using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using SpendSmart.Budget.API.Data;
using SpendSmart.Budget.API.DTOs;
using SpendSmart.Budget.API.Repositories.Interfaces;

namespace SpendSmart.Budget.API.Repositories;

public class BudgetRepository : IBudgetRepository
{
    private readonly AppDbContext _context;

    public BudgetRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<BudgetResponse>> GetAllBudgetsAsync(int userId)
    {
        return await _context.Budgets
            .Where(b => b.UserId == userId && b.IsActive)
            .OrderByDescending(b => b.StartDate)
            .Select(MapToResponseExpression())
            .ToListAsync();
    }

    public async Task<BudgetResponse?> GetBudgetByIdAsync(int budgetId)
    {
        var budget = await _context.Budgets
            .Where(b => b.BudgetId == budgetId && b.IsActive)
            .FirstOrDefaultAsync();

        return budget == null ? null : MapToResponse(budget);
    }

    public async Task<BudgetResponse> CreateBudgetAsync(int userId, BudgetRequest request)
    {
        var budget = new Models.Budget
        {
            UserId = userId,
            CategoryId = request.CategoryId,
            LimitAmount = request.LimitAmount,
            SpentAmount = 0,
            Period = request.Period,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Budgets.Add(budget);
        await _context.SaveChangesAsync();

        return MapToResponse(budget);
    }

    public async Task<BudgetResponse> UpdateBudgetAsync(int budgetId, int userId, BudgetRequest request)
    {
        var budget = await _context.Budgets.FindAsync(budgetId);

        if (budget == null || budget.UserId != userId || !budget.IsActive)
        {
            throw new InvalidOperationException("Budget not found.");
        }

        budget.CategoryId = request.CategoryId;
        budget.LimitAmount = request.LimitAmount;
        budget.Period = request.Period;
        budget.StartDate = request.StartDate;
        budget.EndDate = request.EndDate;
        budget.UpdatedAt = DateTime.UtcNow;

        _context.Budgets.Update(budget);
        await _context.SaveChangesAsync();

        return MapToResponse(budget);
    }

    public async Task DeleteBudgetAsync(int budgetId)
    {
        var budget = await _context.Budgets.FindAsync(budgetId);

        if (budget == null)
        {
            throw new InvalidOperationException("Budget not found.");
        }

        budget.IsActive = false;
        budget.UpdatedAt = DateTime.UtcNow;

        _context.Budgets.Update(budget);
        await _context.SaveChangesAsync();
    }

    private static BudgetResponse MapToResponse(Models.Budget budget)
    {
        var remaining = budget.LimitAmount - budget.SpentAmount;
        var usage = budget.LimitAmount <= 0 ? 0 : (budget.SpentAmount / budget.LimitAmount) * 100;

        return new BudgetResponse
        {
            BudgetId = budget.BudgetId,
            UserId = budget.UserId,
            CategoryId = budget.CategoryId,
            LimitAmount = budget.LimitAmount,
            SpentAmount = budget.SpentAmount,
            Period = budget.Period,
            StartDate = budget.StartDate,
            EndDate = budget.EndDate,
            RemainingAmount = remaining,
            UsagePercentage = usage,
            CreatedAt = budget.CreatedAt,
            UpdatedAt = budget.UpdatedAt
        };
    }

    private static System.Linq.Expressions.Expression<Func<Models.Budget, BudgetResponse>> MapToResponseExpression()
    {
        return budget => new BudgetResponse
        {
            BudgetId = budget.BudgetId,
            UserId = budget.UserId,
            CategoryId = budget.CategoryId,
            LimitAmount = budget.LimitAmount,
            SpentAmount = budget.SpentAmount,
            Period = budget.Period,
            StartDate = budget.StartDate,
            EndDate = budget.EndDate,
            RemainingAmount = budget.LimitAmount - budget.SpentAmount,
            UsagePercentage = budget.LimitAmount <= 0 ? 0 : (budget.SpentAmount / budget.LimitAmount) * 100,
            CreatedAt = budget.CreatedAt,
            UpdatedAt = budget.UpdatedAt
        };
    }
}
