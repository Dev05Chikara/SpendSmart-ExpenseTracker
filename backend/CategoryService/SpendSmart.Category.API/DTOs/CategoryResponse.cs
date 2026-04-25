namespace SpendSmart.Category.API.DTOs;

public class CategoryResponse
{
    public int CategoryId { get; set; }
    public int UserId { get; set; }
    public string Name { get; set; } = default!;
    public string Icon { get; set; } = default!;
    public string Color { get; set; } = default!;
    public string Type { get; set; } = default!;
    public bool IsDefault { get; set; }
    public bool IsActive { get; set; }
}
