namespace SpendSmart.Budget.API.Integration;

public class ExpenseDto
{
    public int ExpenseId { get; set; }
    public int UserId { get; set; }
    public int CategoryId { get; set; }
    public decimal Amount { get; set; }
    public DateTime Date { get; set; }
    public bool IsActive { get; set; }
}