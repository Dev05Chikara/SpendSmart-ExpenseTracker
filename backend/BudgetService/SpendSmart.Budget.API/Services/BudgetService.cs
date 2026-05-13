using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using SpendSmart.Budget.API.DTOs;
using SpendSmart.Budget.API.Integration;
using SpendSmart.Budget.API.Repositories.Interfaces;
using SpendSmart.Budget.API.Services.Interfaces;
using SpendSmart.Budget.API.Integration.Interfaces;
using Microsoft.Extensions.Logging;
using SpendSmart.Budget.API.Models;

namespace SpendSmart.Budget.API.Services;

public class BudgetService : IBudgetService
{
    private readonly IBudgetRepository _repository;
    private readonly IExpenseIntegrationService _expenseIntegrationService;
    private readonly ICategoryIntegrationService _categoryIntegrationService;
    private readonly ILogger<BudgetService> _logger;

    public BudgetService(
        IBudgetRepository repository,
        IExpenseIntegrationService expenseIntegrationService,
        ICategoryIntegrationService categoryIntegrationService,
        ILogger<BudgetService> logger)
    {
        _repository = repository;
        _expenseIntegrationService = expenseIntegrationService;
        _categoryIntegrationService = categoryIntegrationService;
        _logger = logger;
    }

    public async Task<List<BudgetResponse>> GetAllBudgetsAsync(int userId, string authToken)
    {
        var budgets = await _repository.GetAllBudgetsAsync(userId);
        return await EnrichBudgetsAsync(budgets, authToken);
    }

    public async Task<BudgetResponse> GetBudgetByIdAsync(int budgetId, string authToken)
    {
        var budget = await _repository.GetBudgetByIdAsync(budgetId);

        if (budget == null)
        {
            throw new InvalidOperationException("Budget not found.");
        }

        return await EnrichBudgetAsync(budget, authToken);
    }

    public async Task<BudgetResponse> CreateBudgetAsync(int userId, BudgetRequest request, string authToken)
    {
        if (request.LimitAmount <= 0)
        {
            throw new InvalidOperationException("Limit amount must be greater than zero.");
        }

        if (request.EndDate < request.StartDate)
        {
            throw new InvalidOperationException("End date cannot be before start date.");
        }

        var budget = await _repository.CreateBudgetAsync(userId, request);
        return await EnrichBudgetAsync(budget, authToken);
    }

    public async Task<BudgetResponse> UpdateBudgetAsync(int budgetId, int userId, BudgetRequest request, string authToken)
    {
        if (request.LimitAmount <= 0)
        {
            throw new InvalidOperationException("Limit amount must be greater than zero.");
        }

        if (request.EndDate < request.StartDate)
        {
            throw new InvalidOperationException("End date cannot be before start date.");
        }

        var budget = await _repository.UpdateBudgetAsync(budgetId, userId, request);
        return await EnrichBudgetAsync(budget, authToken);
    }

    public async Task DeleteBudgetAsync(int budgetId)
    {
        await _repository.DeleteBudgetAsync(budgetId);
    }

    private async Task<List<BudgetResponse>> EnrichBudgetsAsync(List<BudgetResponse> budgets, string authToken)
    {
        try
        {
            var expenses = await _expenseIntegrationService.GetUserExpensesAsync(authToken);

            foreach (var budget in budgets)
            {
                ApplySpentData(budget, expenses);
                budget.CategoryName = await _categoryIntegrationService.GetCategoryNameAsync(budget.CategoryId, authToken)
                    ?? $"Category {budget.CategoryId}";
                await QueueThresholdAlertsAsync(budget);
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Expense/Category integration failed while loading budgets. Returning stored budget values.");
        }

        return budgets;
    }

    private async Task<BudgetResponse> EnrichBudgetAsync(BudgetResponse budget, string authToken)
    {
        try
        {
            var expenses = await _expenseIntegrationService.GetUserExpensesAsync(authToken);
            ApplySpentData(budget, expenses);
            budget.CategoryName = await _categoryIntegrationService.GetCategoryNameAsync(budget.CategoryId, authToken)
                ?? $"Category {budget.CategoryId}";
            await QueueThresholdAlertsAsync(budget);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Expense/Category integration failed while loading budget {BudgetId}. Returning stored budget values.", budget.BudgetId);
        }

        return budget;
    }

    private static void ApplySpentData(BudgetResponse budget, IEnumerable<ExpenseDto> expenses)
    {
        var spentAmount = expenses
            .Where(expense => expense.IsActive
                && expense.CategoryId == budget.CategoryId
                && expense.Date.Date >= budget.StartDate.Date
                && expense.Date.Date <= budget.EndDate.Date)
            .Sum(expense => expense.Amount);

        budget.SpentAmount = spentAmount;
        budget.RemainingAmount = budget.LimitAmount - spentAmount;
        budget.UsagePercentage = budget.LimitAmount <= 0 ? 0 : (spentAmount / budget.LimitAmount) * 100;
    }

    private async Task QueueThresholdAlertsAsync(BudgetResponse budget)
    {
        var thresholds = new[] { 80m, 100m };
        var categoryLabel = string.IsNullOrWhiteSpace(budget.CategoryName)
            ? $"Category {budget.CategoryId}"
            : budget.CategoryName;

        foreach (var threshold in thresholds)
        {
            if (budget.UsagePercentage < threshold)
            {
                continue;
            }

            var alreadyQueued = await _repository.HasPendingAlertAsync(budget.BudgetId, threshold);
            if (alreadyQueued)
            {
                continue;
            }

            var title = threshold >= 100m ? "Budget Breached" : "Budget Alert";
            var message = threshold >= 100m
                ? $"Your budget for {categoryLabel} has exceeded the limit ({budget.UsagePercentage:0.#}% used)."
                : $"Your budget for {categoryLabel} has reached {budget.UsagePercentage:0.#}% of the limit.";

            await _repository.EnqueueAlertAsync(new BudgetAlertOutbox
            {
                BudgetId = budget.BudgetId,
                UserId = budget.UserId,
                CategoryId = budget.CategoryId,
                ThresholdPercentage = threshold,
                CurrentUsagePercentage = budget.UsagePercentage,
                LimitAmount = budget.LimitAmount,
                SpentAmount = budget.SpentAmount,
                Title = title,
                Message = message,
                Type = threshold >= 100m ? "BudgetBreached" : "BudgetAlert",
                CreatedAt = DateTime.UtcNow
            });
        }
    }
}
