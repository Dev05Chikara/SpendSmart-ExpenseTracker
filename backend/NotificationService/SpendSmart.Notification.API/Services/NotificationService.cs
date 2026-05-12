using SpendSmart.Notification.API.DTOs;
using SpendSmart.Notification.API.Models;
using SpendSmart.Notification.API.Repositories.Interfaces;
using SpendSmart.Notification.API.Services.Interfaces;

namespace SpendSmart.Notification.API.Services;

public class NotificationService : INotificationService
{
    private readonly INotificationRepository _repository;

    public NotificationService(INotificationRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<NotificationResponse>> GetAllNotificationsAsync(int userId)
    {
        var notifications = await _repository.GetAllByUserIdAsync(userId);

        return notifications.Select(MapToResponse).ToList();
    }

    public async Task<NotificationResponse> CreateNotificationAsync(int userId, NotificationRequest request)
    {
        var notification = new AppNotification
        {
            UserId = userId,
            Title = request.Title,
            Message = request.Message,
            Type = request.Type,
            IsRead = false,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        var created = await _repository.CreateAsync(notification);
        return MapToResponse(created);
    }

    public async Task<NotificationResponse> CreateBudgetAlertNotificationAsync(BudgetAlertNotificationRequest request)
    {
        var alreadyExists = await _repository.BudgetAlertExistsAsync(request.UserId, request.BudgetId, request.ThresholdPercentage);
        if (alreadyExists)
        {
            var existing = await _repository.GetAllByUserIdAsync(request.UserId);
            var notification = existing.FirstOrDefault(n =>
                n.BudgetId == request.BudgetId &&
                n.ThresholdPercentage == request.ThresholdPercentage &&
                n.IsActive);

            if (notification != null)
            {
                return MapToResponse(notification);
            }
        }

        var notificationEntity = new AppNotification
        {
            UserId = request.UserId,
            BudgetId = request.BudgetId,
            ThresholdPercentage = request.ThresholdPercentage,
            Title = request.Title,
            Message = request.Message,
            Type = request.Type,
            IsRead = false,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        var created = await _repository.CreateAsync(notificationEntity);
        return MapToResponse(created);
    }

    public async Task<NotificationResponse> MarkAsReadAsync(int id, int userId)
    {
        var updated = await _repository.MarkAsReadAsync(id, userId);
        if (updated == null)
        {
            throw new InvalidOperationException("Notification not found.");
        }

        return MapToResponse(updated);
    }

    public async Task DeleteNotificationAsync(int id, int userId)
    {
        var deleted = await _repository.DeleteAsync(id, userId);
        if (!deleted)
        {
            throw new InvalidOperationException("Notification not found.");
        }
    }

    private static NotificationResponse MapToResponse(AppNotification notification)
    {
        return new NotificationResponse
        {
            NotificationId = notification.NotificationId,
            UserId = notification.UserId,
            Title = notification.Title,
            Message = notification.Message,
            Type = notification.Type,
            BudgetId = notification.BudgetId,
            ThresholdPercentage = notification.ThresholdPercentage,
            IsRead = notification.IsRead,
            CreatedAt = notification.CreatedAt
        };
    }
}
