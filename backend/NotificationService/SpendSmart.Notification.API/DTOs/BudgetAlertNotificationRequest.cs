using System.ComponentModel.DataAnnotations;

namespace SpendSmart.Notification.API.DTOs;

public class BudgetAlertNotificationRequest
{
    [Required]
    public int BudgetId { get; set; }

    [Required]
    public int UserId { get; set; }

    [Required]
    public int CategoryId { get; set; }

    [Required]
    public decimal ThresholdPercentage { get; set; }

    [Required]
    public decimal UsagePercentage { get; set; }

    [Required]
    public decimal LimitAmount { get; set; }

    [Required]
    public decimal SpentAmount { get; set; }

    [Required]
    [MaxLength(100)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [MaxLength(500)]
    public string Message { get; set; } = string.Empty;

    [MaxLength(50)]
    public string Type { get; set; } = "BudgetAlert";
}