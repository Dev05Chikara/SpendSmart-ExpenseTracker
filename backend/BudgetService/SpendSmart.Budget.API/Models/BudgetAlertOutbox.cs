namespace SpendSmart.Budget.API.Models;

public class BudgetAlertOutbox
{
    public int Id { get; set; }
    public int BudgetId { get; set; }
    public int UserId { get; set; }
    public int CategoryId { get; set; }
    public decimal ThresholdPercentage { get; set; }
    public decimal CurrentUsagePercentage { get; set; }
    public decimal LimitAmount { get; set; }
    public decimal SpentAmount { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Type { get; set; } = "BudgetAlert";
    public bool IsDelivered { get; set; }
    public int AttemptCount { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastAttemptAt { get; set; }
    public DateTime? DeliveredAt { get; set; }
    public string? LastError { get; set; }
}