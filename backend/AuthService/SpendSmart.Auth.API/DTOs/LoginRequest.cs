namespace SpendSmart.Auth.API.DTOs;

/// <summary>
/// Data Transfer Object for user login request.
/// </summary>
public class LoginRequest
{
    /// <summary>
    /// Gets or sets the user's email address.
    /// </summary>
    public string Email { get; set; } = null!;

    /// <summary>
    /// Gets or sets the user's password.
    /// </summary>
    public string Password { get; set; } = null!;
}
