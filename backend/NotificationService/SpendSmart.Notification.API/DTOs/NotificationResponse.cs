using System;

namespace SpendSmart.Notification.API.DTOs;

public class NotificationResponse
{
    public int NotificationId { get; set; }
    public int UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public int? BudgetId { get; set; }
    public decimal? ThresholdPercentage { get; set; }
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }
}
