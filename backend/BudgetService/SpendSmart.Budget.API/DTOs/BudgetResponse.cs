using System;

namespace SpendSmart.Budget.API.DTOs;

public class BudgetResponse
{
    public int BudgetId { get; set; }
    public int UserId { get; set; }
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public decimal LimitAmount { get; set; }
    public decimal SpentAmount { get; set; }
    public string Period { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal RemainingAmount { get; set; }
    public decimal UsagePercentage { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
