using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using SpendSmart.Income.API.DTOs;

namespace SpendSmart.Income.API.Repositories.Interfaces;

public interface IIncomeRepository
{
    Task<List<IncomeResponse>> GetAllIncomesAsync(int userId);
    Task<IncomeResponse?> GetIncomeByIdAsync(int incomeId);
    Task<List<IncomeResponse>> GetIncomesByDateRangeAsync(int userId, DateTime startDate, DateTime endDate);
    Task<IncomeResponse> CreateIncomeAsync(int userId, IncomeRequest request);
    Task<IncomeResponse> UpdateIncomeAsync(int incomeId, int userId, IncomeRequest request);
    Task DeleteIncomeAsync(int incomeId);
}
