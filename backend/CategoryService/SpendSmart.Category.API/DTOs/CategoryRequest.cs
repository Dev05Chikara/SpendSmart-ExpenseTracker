namespace SpendSmart.Category.API.DTOs;

public class CategoryRequest
{
    public string Name { get; set; } = default!;
    public string Icon { get; set; } = default!;
    public string Color { get; set; } = default!;
    public string Type { get; set; } = default!; // "Expense" or "Income"
}
