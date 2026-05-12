using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using SpendSmart.Income.API.DTOs;
using SpendSmart.Income.API.Repositories.Interfaces;
using SpendSmart.Income.API.Services.Interfaces;

namespace SpendSmart.Income.API.Services;

public class IncomeService : IIncomeService
{
    private readonly IIncomeRepository _repository;

    public IncomeService(IIncomeRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<IncomeResponse>> GetAllIncomesAsync(int userId)
    {
        return await _repository.GetAllIncomesAsync(userId);
    }

    public async Task<IncomeResponse> GetIncomeByIdAsync(int incomeId)
    {
        var income = await _repository.GetIncomeByIdAsync(incomeId);

        if (income == null)
            throw new InvalidOperationException("Income not found.");

        return income;
    }

    public async Task<List<IncomeResponse>> GetIncomesByDateRangeAsync(int userId, DateTime startDate, DateTime endDate)
    {
        return await _repository.GetIncomesByDateRangeAsync(userId, startDate, endDate);
    }

    public async Task<IncomeResponse> CreateIncomeAsync(int userId, IncomeRequest request)
    {
        return await _repository.CreateIncomeAsync(userId, request);

        // TODO: Publish IncomeAddedEvent for MassTransit message bus
    }

    public async Task<IncomeResponse> UpdateIncomeAsync(int incomeId, int userId, IncomeRequest request)
    {
        try
        {
            return await _repository.UpdateIncomeAsync(incomeId, userId, request);
        }
        catch (InvalidOperationException)
        {
            throw new UnauthorizedAccessException("You don't have permission to update this income.");
        }
    }

    public async Task DeleteIncomeAsync(int incomeId)
    {
        await _repository.DeleteIncomeAsync(incomeId);
    }
}
