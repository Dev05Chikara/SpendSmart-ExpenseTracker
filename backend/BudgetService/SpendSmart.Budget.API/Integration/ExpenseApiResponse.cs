namespace SpendSmart.Budget.API.Integration;

public class ExpenseApiResponse<T>
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public T? Data { get; set; }
}