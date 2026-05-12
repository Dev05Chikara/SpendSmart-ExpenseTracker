using System.Collections.Generic;
using System.Threading.Tasks;
using SpendSmart.Budget.API.DTOs;
using SpendSmart.Budget.API.Models;

namespace SpendSmart.Budget.API.Repositories.Interfaces;

public interface IBudgetRepository
{
    Task<List<BudgetResponse>> GetAllBudgetsAsync(int userId);
    Task<BudgetResponse?> GetBudgetByIdAsync(int budgetId);
    Task<BudgetResponse> CreateBudgetAsync(int userId, BudgetRequest request);
    Task<BudgetResponse> UpdateBudgetAsync(int budgetId, int userId, BudgetRequest request);
    Task DeleteBudgetAsync(int budgetId);

    Task<bool> HasPendingAlertAsync(int budgetId, decimal thresholdPercentage);
    Task<BudgetAlertOutbox> EnqueueAlertAsync(BudgetAlertOutbox alert);
    Task<List<BudgetAlertOutbox>> GetPendingAlertsAsync(int batchSize);
    Task MarkAlertDeliveredAsync(int id);
    Task MarkAlertFailedAsync(int id, string errorMessage);
}
