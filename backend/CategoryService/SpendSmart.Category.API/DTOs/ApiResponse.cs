namespace SpendSmart.Category.API.DTOs;

public class ApiResponse<T>
{
    public bool Success { get; set; }
    public string Message { get; set; } = default!;
    public T? Data { get; set; }

    public ApiResponse(bool success, string message, T? data = default)
    {
        Success = success;
        Message = message;
        Data = data;
    }
}
