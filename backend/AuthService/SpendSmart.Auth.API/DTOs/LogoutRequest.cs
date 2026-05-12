namespace SpendSmart.Auth.API.DTOs;

/// <summary>
/// Represents a logout request.
/// </summary>
public class LogoutRequest
{
    /// <summary>
    /// Gets or sets the JWT token to be revoked.
    /// </summary>
    public string Token { get; set; } = string.Empty;
}
