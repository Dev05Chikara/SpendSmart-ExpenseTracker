namespace SpendSmart.Auth.API.DTOs;

/// <summary>
/// Data Transfer Object for login response.
/// </summary>
public class LoginResponse
{
    /// <summary>
    /// Gets or sets the JWT authentication token.
    /// </summary>
    public string Token { get; set; } = null!;

    /// <summary>
    /// Gets or sets the user information.
    /// </summary>
    public UserResponse User { get; set; } = null!;
}
