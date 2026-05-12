using SpendSmart.Notification.API.Models;

namespace SpendSmart.Notification.API.Repositories.Interfaces;

public interface INotificationRepository
{
    Task<List<AppNotification>> GetAllByUserIdAsync(int userId);
    Task<AppNotification?> GetByIdAsync(int id, int userId);
    Task<bool> BudgetAlertExistsAsync(int userId, int? budgetId, decimal? thresholdPercentage);
    Task<AppNotification> CreateAsync(AppNotification notification);
    Task<AppNotification?> MarkAsReadAsync(int id, int userId);
    Task<bool> DeleteAsync(int id, int userId);
}
