using SpendSmart.Notification.API.DTOs;

namespace SpendSmart.Notification.API.Services.Interfaces;

public interface INotificationService
{
    Task<List<NotificationResponse>> GetAllNotificationsAsync(int userId);
    Task<NotificationResponse> CreateNotificationAsync(int userId, NotificationRequest request);
    Task<NotificationResponse> CreateBudgetAlertNotificationAsync(BudgetAlertNotificationRequest request);
    Task<NotificationResponse> MarkAsReadAsync(int id, int userId);
    Task DeleteNotificationAsync(int id, int userId);
}
