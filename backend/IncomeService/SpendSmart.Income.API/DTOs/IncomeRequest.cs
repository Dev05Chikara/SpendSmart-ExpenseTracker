using System;

namespace SpendSmart.Income.API.DTOs;

public class IncomeRequest
{
    public decimal Amount { get; set; }
    public DateTime Date { get; set; }
    public string Description { get; set; } = string.Empty;
    public string Source { get; set; } = string.Empty;
    public bool IsRecurring { get; set; }
    public string? RecurrenceType { get; set; }
}
