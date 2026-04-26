namespace SpendSmart.Expense.API.Models;

public class Expense
{
    public int ExpenseId { get; set; }
    public int UserId { get; set; }
    public int CategoryId { get; set; }
    public decimal Amount { get; set; }
    public DateTime Date { get; set; }
    public string Description { get; set; } = default!;
    public string PaymentMode { get; set; } = default!; // "Cash", "Card", "Bank", "Digital"
    public string? ReceiptUrl { get; set; }
    public bool IsRecurring { get; set; }
    public bool IsActive { get; set; } = true;
}
