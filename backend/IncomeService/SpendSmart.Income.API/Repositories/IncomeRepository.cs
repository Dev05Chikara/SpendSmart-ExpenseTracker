using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using SpendSmart.Income.API.Data;
using SpendSmart.Income.API.DTOs;
using SpendSmart.Income.API.Repositories.Interfaces;

namespace SpendSmart.Income.API.Repositories;

public class IncomeRepository : IIncomeRepository
{
    private readonly AppDbContext _context;

    public IncomeRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<IncomeResponse>> GetAllIncomesAsync(int userId)
    {
        return await _context.Incomes
            .Where(i => i.UserId == userId && i.IsActive)
            .OrderByDescending(i => i.Date)
            .Select(i => new IncomeResponse
            {
                IncomeId = i.IncomeId,
                UserId = i.UserId,
                Amount = i.Amount,
                Date = i.Date,
                Description = i.Description,
                Source = i.Source,
                IsRecurring = i.IsRecurring,
                CreatedAt = i.CreatedAt,
                UpdatedAt = i.UpdatedAt
            })
            .ToListAsync();
    }

    public async Task<IncomeResponse?> GetIncomeByIdAsync(int incomeId)
    {
        var income = await _context.Incomes
            .Where(i => i.IncomeId == incomeId && i.IsActive)
            .FirstOrDefaultAsync();

        if (income == null)
            return null;

        return new IncomeResponse
        {
            IncomeId = income.IncomeId,
            UserId = income.UserId,
            Amount = income.Amount,
            Date = income.Date,
            Description = income.Description,
            Source = income.Source,
            IsRecurring = income.IsRecurring,
            CreatedAt = income.CreatedAt,
            UpdatedAt = income.UpdatedAt
        };
    }

    public async Task<List<IncomeResponse>> GetIncomesByDateRangeAsync(int userId, DateTime startDate, DateTime endDate)
    {
        return await _context.Incomes
            .Where(i => i.UserId == userId && i.IsActive && i.Date >= startDate && i.Date <= endDate)
            .OrderByDescending(i => i.Date)
            .Select(i => new IncomeResponse
            {
                IncomeId = i.IncomeId,
                UserId = i.UserId,
                Amount = i.Amount,
                Date = i.Date,
                Description = i.Description,
                Source = i.Source,
                IsRecurring = i.IsRecurring,
                CreatedAt = i.CreatedAt,
                UpdatedAt = i.UpdatedAt
            })
            .ToListAsync();
    }

    public async Task<IncomeResponse> CreateIncomeAsync(int userId, IncomeRequest request)
    {
        var income = new Models.Income
        {
            UserId = userId,
            Amount = request.Amount,
            Date = request.Date,
            Description = request.Description,
            Source = request.Source,
            IsRecurring = request.IsRecurring,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Incomes.Add(income);
        await _context.SaveChangesAsync();

        return new IncomeResponse
        {
            IncomeId = income.IncomeId,
            UserId = income.UserId,
            Amount = income.Amount,
            Date = income.Date,
            Description = income.Description,
            Source = income.Source,
            IsRecurring = income.IsRecurring,
            CreatedAt = income.CreatedAt,
            UpdatedAt = income.UpdatedAt
        };
    }

    public async Task<IncomeResponse> UpdateIncomeAsync(int incomeId, int userId, IncomeRequest request)
    {
        var income = await _context.Incomes.FindAsync(incomeId);

        if (income == null || income.UserId != userId || !income.IsActive)
            throw new InvalidOperationException("Income not found.");

        income.Amount = request.Amount;
        income.Date = request.Date;
        income.Description = request.Description;
        income.Source = request.Source;
        income.IsRecurring = request.IsRecurring;
        income.UpdatedAt = DateTime.UtcNow;

        _context.Incomes.Update(income);
        await _context.SaveChangesAsync();

        return new IncomeResponse
        {
            IncomeId = income.IncomeId,
            UserId = income.UserId,
            Amount = income.Amount,
            Date = income.Date,
            Description = income.Description,
            Source = income.Source,
            IsRecurring = income.IsRecurring,
            CreatedAt = income.CreatedAt,
            UpdatedAt = income.UpdatedAt
        };
    }

    public async Task DeleteIncomeAsync(int incomeId)
    {
        var income = await _context.Incomes.FindAsync(incomeId);

        if (income == null)
            throw new InvalidOperationException("Income not found.");

        income.IsActive = false;
        income.UpdatedAt = DateTime.UtcNow;

        _context.Incomes.Update(income);
        await _context.SaveChangesAsync();
    }
}
