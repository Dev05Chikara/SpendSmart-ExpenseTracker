namespace SpendSmart.Budget.API.Integration;

public class BudgetAlertNotificationRequest
{
    public int BudgetId { get; set; }
    public int UserId { get; set; }
    public int CategoryId { get; set; }
    public decimal ThresholdPercentage { get; set; }
    public decimal UsagePercentage { get; set; }
    public decimal LimitAmount { get; set; }
    public decimal SpentAmount { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Type { get; set; } = "BudgetAlert";
}