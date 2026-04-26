using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using SpendSmart.Budget.API.DTOs;
using SpendSmart.Budget.API.Repositories.Interfaces;
using SpendSmart.Budget.API.Services.Interfaces;

namespace SpendSmart.Budget.API.Services;

public class BudgetService : IBudgetService
{
    private readonly IBudgetRepository _repository;

    public BudgetService(IBudgetRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<BudgetResponse>> GetAllBudgetsAsync(int userId)
    {
        return await _repository.GetAllBudgetsAsync(userId);
    }

    public async Task<BudgetResponse> GetBudgetByIdAsync(int budgetId)
    {
        var budget = await _repository.GetBudgetByIdAsync(budgetId);

        if (budget == null)
        {
            throw new InvalidOperationException("Budget not found.");
        }

        return budget;
    }

    public async Task<BudgetResponse> CreateBudgetAsync(int userId, BudgetRequest request)
    {
        if (request.LimitAmount <= 0)
        {
            throw new InvalidOperationException("Limit amount must be greater than zero.");
        }

        if (request.EndDate < request.StartDate)
        {
            throw new InvalidOperationException("End date cannot be before start date.");
        }

        return await _repository.CreateBudgetAsync(userId, request);
    }

    public async Task<BudgetResponse> UpdateBudgetAsync(int budgetId, int userId, BudgetRequest request)
    {
        if (request.LimitAmount <= 0)
        {
            throw new InvalidOperationException("Limit amount must be greater than zero.");
        }

        if (request.EndDate < request.StartDate)
        {
            throw new InvalidOperationException("End date cannot be before start date.");
        }

        return await _repository.UpdateBudgetAsync(budgetId, userId, request);
    }

    public async Task DeleteBudgetAsync(int budgetId)
    {
        await _repository.DeleteBudgetAsync(budgetId);
    }
}
