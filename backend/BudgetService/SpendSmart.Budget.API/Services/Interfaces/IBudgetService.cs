using System.Collections.Generic;
using System.Threading.Tasks;
using SpendSmart.Budget.API.DTOs;

namespace SpendSmart.Budget.API.Services.Interfaces;

public interface IBudgetService
{
    Task<List<BudgetResponse>> GetAllBudgetsAsync(int userId);
    Task<BudgetResponse> GetBudgetByIdAsync(int budgetId);
    Task<BudgetResponse> CreateBudgetAsync(int userId, BudgetRequest request);
    Task<BudgetResponse> UpdateBudgetAsync(int budgetId, int userId, BudgetRequest request);
    Task DeleteBudgetAsync(int budgetId);
}
