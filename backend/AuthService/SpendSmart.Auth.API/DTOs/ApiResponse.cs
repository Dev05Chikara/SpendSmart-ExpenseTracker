namespace SpendSmart.Auth.API.DTOs;

/// <summary>
/// Generic API response wrapper for consistent response format.
/// </summary>
/// <typeparam name="T">The type of data in the response.</typeparam>
public class ApiResponse<T>
{
    /// <summary>
    /// Gets or sets a value indicating whether the request was successful.
    /// </summary>
    public bool Success { get; set; }

    /// <summary>
    /// Gets or sets the response message.
    /// </summary>
    public string Message { get; set; } = null!;

    /// <summary>
    /// Gets or sets the response data.
    /// </summary>
    public T? Data { get; set; }

    /// <summary>
    /// Initializes a new instance of the <see cref="ApiResponse{T}"/> class.
    /// </summary>
    public ApiResponse()
    {
    }

    /// <summary>
    /// Initializes a new instance of the <see cref="ApiResponse{T}"/> class with parameters.
    /// </summary>
    /// <param name="success">Whether the request was successful.</param>
    /// <param name="message">The response message.</param>
    /// <param name="data">The response data.</param>
    public ApiResponse(bool success, string message, T? data = default)
    {
        Success = success;
        Message = message;
        Data = data;
    }
}
