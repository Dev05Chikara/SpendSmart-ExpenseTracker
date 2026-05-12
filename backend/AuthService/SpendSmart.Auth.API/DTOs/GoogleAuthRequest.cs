namespace SpendSmart.Auth.API.DTOs;

/// <summary>
/// DTO for Google OAuth authentication request
/// Contains the ID token from Google Sign-In
/// </summary>
public class GoogleAuthRequest
{
    /// <summary>
    /// Google ID token received from Google Sign-In
    /// JWT format token that contains user information
    /// </summary>
    public required string IdToken { get; set; }
}
