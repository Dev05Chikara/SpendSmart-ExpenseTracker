namespace SpendSmart.Auth.API.Services.Interfaces;

using SpendSmart.Auth.API.DTOs;

/// <summary>
/// Interface for Google OAuth authentication service
/// Handles validation of Google ID tokens and user creation/linking
/// </summary>
public interface IGoogleAuthService
{
    /// <summary>
    /// Validates Google ID token and authenticates/creates user
    /// </summary>
    /// <param name="idToken">Google ID token from Sign-In</param>
    /// <returns>LoginResponse with JWT token</returns>
    Task<LoginResponse> AuthenticateWithGoogleAsync(string idToken);
}
