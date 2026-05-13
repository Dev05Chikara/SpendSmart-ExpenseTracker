using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using SpendSmart.Expense.API.Data;
using SpendSmart.Expense.API.Services;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace SpendSmart.Expense.API.HostedServices;

public class RecurringExpenseProcessorService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<RecurringExpenseProcessorService> _logger;

    public RecurringExpenseProcessorService(IServiceScopeFactory scopeFactory, ILogger<RecurringExpenseProcessorService> logger)
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
                await ProcessRecurringExpensesAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to process recurring expenses.");
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

    private async Task ProcessRecurringExpensesAsync(CancellationToken stoppingToken)
    {
        using var scope = _scopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var now = DateTime.UtcNow;

        // Find all active recurring expenses where NextDueDate has arrived OR is null (legacy records)
        var pendingExpenses = dbContext.Expenses
            .Where(e => e.IsActive && e.IsRecurring && (e.NextDueDate == null || e.NextDueDate <= now))
            .ToList();

        if (!pendingExpenses.Any())
            return;

        _logger.LogInformation($"Found {pendingExpenses.Count} recurring expenses to process.");

        foreach (var parent in pendingExpenses)
        {
            // Initialize NextDueDate for legacy records created before the engine was deployed
            if (parent.NextDueDate == null)
            {
                parent.NextDueDate = ExpenseService.CalculateNextDueDate(parent.Date, parent.RecurrenceType);
            }

            // Process all missed occurrences until the NextDueDate is in the future
            while (parent.NextDueDate != null && parent.NextDueDate <= now)
            {
                // Clone the expense for the new date
                var newExpense = new Models.Expense
                {
                    UserId = parent.UserId,
                    CategoryId = parent.CategoryId,
                    Amount = parent.Amount,
                    Date = parent.NextDueDate.Value,
                    Description = parent.Description,
                    PaymentMode = parent.PaymentMode,
                    // The newly cloned expense is just a normal historical expense
                    IsRecurring = false,
                    RecurrenceType = null,
                    NextDueDate = null,
                    IsActive = true
                };

                dbContext.Expenses.Add(newExpense);

                // Update the parent's next due date for the next cycle
                parent.NextDueDate = ExpenseService.CalculateNextDueDate(parent.NextDueDate.Value, parent.RecurrenceType);
            }
            
            dbContext.Expenses.Update(parent);
            
            // Save changes per parent to ensure partial success if one fails
            await dbContext.SaveChangesAsync(stoppingToken);
        }

        await dbContext.SaveChangesAsync(stoppingToken);
        _logger.LogInformation("Successfully processed recurring expenses.");
    }
}
