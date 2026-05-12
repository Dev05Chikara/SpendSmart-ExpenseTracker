using System;
using System.ComponentModel.DataAnnotations;

namespace SpendSmart.Notification.API.Models;

public class AppNotification
{
    [Key]
    public int NotificationId { get; set; }

    public int UserId { get; set; }

    [Required]
    [MaxLength(100)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [MaxLength(500)]
    public string Message { get; set; } = string.Empty;

    [MaxLength(50)]
    public string Type { get; set; } = "General";

    public int? BudgetId { get; set; }

    public decimal? ThresholdPercentage { get; set; }

    public bool IsRead { get; set; } = false;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
