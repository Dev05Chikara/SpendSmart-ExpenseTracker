namespace SpendSmart.Auth.API.DTOs;

/// <summary>
/// Data Transfer Object for user registration request.
/// </summary>
public class RegisterRequest
{
    /// <summary>
    /// Gets or sets the user's full name.
    /// </summary>
    public string FullName { get; set; } = null!;

    /// <summary>
    /// Gets or sets the user's email address.
    /// </summary>
    public string Email { get; set; } = null!;

    /// <summary>
    /// Gets or sets the user's password.
    /// </summary>
    public string Password { get; set; } = null!;

    /// <summary>
    /// Gets or sets the user's preferred currency (optional, defaults to INR).
    /// </summary>
    public string Currency { get; set; } = "INR";
}
