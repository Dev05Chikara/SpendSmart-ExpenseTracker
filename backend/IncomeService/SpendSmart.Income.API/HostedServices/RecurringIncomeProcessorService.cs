using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using SpendSmart.Income.API.Data;
using SpendSmart.Income.API.Services;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace SpendSmart.Income.API.HostedServices;

public class RecurringIncomeProcessorService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<RecurringIncomeProcessorService> _logger;

    public RecurringIncomeProcessorService(IServiceScopeFactory scopeFactory, ILogger<RecurringIncomeProcessorService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        // Run every 30 seconds for fast auto-detection and processing
        using var timer = new PeriodicTimer(TimeSpan.FromSeconds(30));

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ProcessRecurringIncomesAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to process recurring incomes.");
            }

            try
            {
                await timer.WaitForNextTickAsync(stoppingToken);
            }
            catch (OperationCanceledException)
            {
                break;
            }
        }
    }

    private async Task ProcessRecurringIncomesAsync(CancellationToken stoppingToken)
    {
        using var scope = _scopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var now = DateTime.UtcNow;

        // Find all active recurring incomes where NextDueDate has arrived OR is null (legacy records)
        var pendingIncomes = dbContext.Incomes
            .Where(i => i.IsActive && i.IsRecurring && (i.NextDueDate == null || i.NextDueDate <= now))
            .ToList();

        if (!pendingIncomes.Any())
            return;

        _logger.LogInformation($"Found {pendingIncomes.Count} recurring incomes to process.");

        foreach (var parent in pendingIncomes)
        {
            // Initialize NextDueDate for legacy records created before the engine was deployed
            if (parent.NextDueDate == null)
            {
                parent.NextDueDate = IncomeService.CalculateNextDueDate(parent.Date, parent.RecurrenceType);
            }

            // Process all missed occurrences until the NextDueDate is in the future
            while (parent.NextDueDate != null && parent.NextDueDate <= now)
            {
                // Clone the income for the new date
                var newIncome = new Models.Income
                {
                    UserId = parent.UserId,
                    Amount = parent.Amount,
                    Date = parent.NextDueDate.Value,
                    Description = parent.Description,
                    Source = parent.Source,
                    // The newly cloned income is just a normal historical income
                    IsRecurring = false,
                    RecurrenceType = null,
                    NextDueDate = null,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };

                dbContext.Incomes.Add(newIncome);

                // Update the parent's next due date for the next cycle
                parent.NextDueDate = IncomeService.CalculateNextDueDate(parent.NextDueDate.Value, parent.RecurrenceType);
            }

            parent.UpdatedAt = DateTime.UtcNow;
            dbContext.Incomes.Update(parent);
            
            // Save changes per parent to ensure partial success if one fails
            await dbContext.SaveChangesAsync(stoppingToken);
        }

        await dbContext.SaveChangesAsync(stoppingToken);
        _logger.LogInformation("Successfully processed recurring incomes.");
    }
}
