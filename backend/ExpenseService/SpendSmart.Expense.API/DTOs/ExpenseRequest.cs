namespace SpendSmart.Expense.API.DTOs;

public class ExpenseRequest
{
    public int CategoryId { get; set; }
    public decimal Amount { get; set; }
    public DateTime Date { get; set; }
    public string Description { get; set; } = default!;
    public string PaymentMode { get; set; } = default!;
    public bool IsRecurring { get; set; }
    public string? RecurrenceType { get; set; }
}
