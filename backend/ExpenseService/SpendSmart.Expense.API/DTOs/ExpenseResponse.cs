namespace SpendSmart.Expense.API.DTOs;

public class ExpenseResponse
{
    public int ExpenseId { get; set; }
    public int UserId { get; set; }
    public int CategoryId { get; set; }
    public decimal Amount { get; set; }
    public DateTime Date { get; set; }
    public string Description { get; set; } = default!;
    public string PaymentMode { get; set; } = default!;
    public string? ReceiptUrl { get; set; }
    public bool IsRecurring { get; set; }
    public string? RecurrenceType { get; set; }
    public bool IsActive { get; set; }
}
