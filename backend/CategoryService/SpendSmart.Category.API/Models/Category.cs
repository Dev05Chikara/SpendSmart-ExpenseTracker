namespace SpendSmart.Category.API.Models;

public class Category
{
    public int CategoryId { get; set; }
    public int UserId { get; set; }
    public string Name { get; set; } = default!;
    public string Icon { get; set; } = default!;
    public string Color { get; set; } = default!;
    public string Type { get; set; } = default!; // "Expense" or "Income"
    public bool IsDefault { get; set; }
    public bool IsActive { get; set; } = true;
}
