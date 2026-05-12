using Microsoft.EntityFrameworkCore;
using SpendSmart.Notification.API.Data;
using SpendSmart.Notification.API.Models;
using SpendSmart.Notification.API.Repositories.Interfaces;

namespace SpendSmart.Notification.API.Repositories;

public class NotificationRepository : INotificationRepository
{
    private readonly AppDbContext _context;

    public NotificationRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<AppNotification>> GetAllByUserIdAsync(int userId)
    {
        return await _context.Notifications
            .Where(n => n.UserId == userId && n.IsActive)
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync();
    }

    public async Task<AppNotification?> GetByIdAsync(int id, int userId)
    {
        return await _context.Notifications
            .FirstOrDefaultAsync(n => n.NotificationId == id && n.UserId == userId && n.IsActive);
    }

    public async Task<bool> BudgetAlertExistsAsync(int userId, int? budgetId, decimal? thresholdPercentage)
    {
        return await _context.Notifications.AnyAsync(n =>
            n.UserId == userId &&
            n.IsActive &&
            n.BudgetId == budgetId &&
            n.ThresholdPercentage == thresholdPercentage);
    }

    public async Task<AppNotification> CreateAsync(AppNotification notification)
    {
        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync();
        return notification;
    }

    public async Task<AppNotification?> MarkAsReadAsync(int id, int userId)
    {
        var notification = await GetByIdAsync(id, userId);
        if (notification == null)
        {
            return null;
        }

        notification.IsRead = true;
        notification.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return notification;
    }

    public async Task<bool> DeleteAsync(int id, int userId)
    {
        var notification = await GetByIdAsync(id, userId);
        if (notification == null)
        {
            return false;
        }

        notification.IsActive = false;
        notification.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }
}
