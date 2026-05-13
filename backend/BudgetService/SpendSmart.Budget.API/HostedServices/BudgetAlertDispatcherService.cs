using System.Net.Http.Json;
using SpendSmart.Budget.API.DTOs;
using SpendSmart.Budget.API.Repositories.Interfaces;

namespace SpendSmart.Budget.API.HostedServices;

public class BudgetAlertDispatcherService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<BudgetAlertDispatcherService> _logger;
    private readonly string _notificationBaseUrl;

    public BudgetAlertDispatcherService(
        IServiceScopeFactory scopeFactory,
        IHttpClientFactory httpClientFactory,
        IConfiguration configuration,
        ILogger<BudgetAlertDispatcherService> logger)
    {
        _scopeFactory = scopeFactory;
        _httpClientFactory = httpClientFactory;
        _logger = logger;
        _notificationBaseUrl = configuration["NotificationService:BaseUrl"] ?? "http://localhost:5007";
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(TimeSpan.FromSeconds(5));

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await DispatchPendingAlertsAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Budget alert dispatch loop failed.");
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

    private async Task DispatchPendingAlertsAsync(CancellationToken cancellationToken)
    {
        using var scope = _scopeFactory.CreateScope();
        var repository = scope.ServiceProvider.GetRequiredService<IBudgetRepository>();
        var pendingAlerts = await repository.GetPendingAlertsAsync(25);

        if (pendingAlerts.Count == 0)
        {
            return;
        }

        var client = _httpClientFactory.CreateClient();
        client.BaseAddress = new Uri(_notificationBaseUrl.TrimEnd('/') + "/");

        foreach (var alert in pendingAlerts)
        {
            try
            {
                var payload = new
                {
                    budgetId = alert.BudgetId,
                    userId = alert.UserId,
                    categoryId = alert.CategoryId,
                    thresholdPercentage = alert.ThresholdPercentage,
                    usagePercentage = alert.CurrentUsagePercentage,
                    limitAmount = alert.LimitAmount,
                    spentAmount = alert.SpentAmount,
                    title = alert.Title,
                    message = alert.Message,
                    type = alert.Type
                };

                var response = await client.PostAsJsonAsync("internal/notifications/budget-alerts", payload, cancellationToken);
                if (response.IsSuccessStatusCode)
                {
                    await repository.MarkAlertDeliveredAsync(alert.Id);
                }
                else
                {
                    var body = await response.Content.ReadAsStringAsync(cancellationToken);
                    await repository.MarkAlertFailedAsync(alert.Id, $"HTTP {(int)response.StatusCode}: {body}");
                }
            }
            catch (Exception ex)
            {
                await repository.MarkAlertFailedAsync(alert.Id, ex.Message);
                _logger.LogWarning(ex, "Failed to dispatch budget alert {AlertId}.", alert.Id);
            }
        }
    }
}