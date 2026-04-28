using System.Collections.Generic;
using System.Threading.Tasks;
using SpendSmart.Budget.API.DTOs;

namespace SpendSmart.Budget.API.Services.Interfaces;

public interface IBudgetService
{
    Task<List<BudgetResponse>> GetAllBudgetsAsync(int userId, string authToken);
    Task<BudgetResponse> GetBudgetByIdAsync(int budgetId, string authToken);
    Task<BudgetResponse> CreateBudgetAsync(int userId, BudgetRequest request, string authToken);
    Task<BudgetResponse> UpdateBudgetAsync(int budgetId, int userId, BudgetRequest request, string authToken);
    Task DeleteBudgetAsync(int budgetId);
}
