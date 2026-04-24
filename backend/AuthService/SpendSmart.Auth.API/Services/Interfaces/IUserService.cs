using SpendSmart.Auth.API.DTOs;

namespace SpendSmart.Auth.API.Services.Interfaces;

/// <summary>
/// Service interface for user authentication and management operations.
/// </summary>
public interface IUserService
{
    /// <summary>
    /// Registers a new user asynchronously.
    /// </summary>
    /// <param name="request">The registration request containing user details and password.</param>
    /// <returns>The created user as a UserResponse.</returns>
    /// <exception cref="InvalidOperationException">Thrown when email already exists.</exception>
    Task<UserResponse> RegisterAsync(RegisterRequest request);

    /// <summary>
    /// Authenticates a user and generates a JWT token asynchronously.
    /// </summary>
    /// <param name="request">The login request containing email and password.</param>
    /// <returns>The login response containing JWT token and user information.</returns>
    /// <exception cref="InvalidOperationException">Thrown when credentials are invalid.</exception>
    Task<LoginResponse> LoginAsync(LoginRequest request);

    /// <summary>
    /// Gets the user profile by user ID asynchronously.
    /// </summary>
    /// <param name="userId">The user ID.</param>
    /// <returns>The user information as a UserResponse.</returns>
    /// <exception cref="InvalidOperationException">Thrown when user is not found.</exception>
    Task<UserResponse> GetProfileAsync(int userId);

    /// <summary>
    /// Updates the user profile asynchronously.
    /// </summary>
    /// <param name="userId">The user ID.</param>
    /// <param name="request">The update request containing new full name and currency.</param>
    /// <returns>The updated user information as a UserResponse.</returns>
    /// <exception cref="InvalidOperationException">Thrown when user is not found.</exception>
    Task<UserResponse> UpdateProfileAsync(int userId, UpdateProfileRequest request);

    /// <summary>
    /// Changes the user password asynchronously.
    /// </summary>
    /// <param name="userId">The user ID.</param>
    /// <param name="request">The change password request containing old and new passwords.</param>
    /// <returns>A success message.</returns>
    /// <exception cref="InvalidOperationException">Thrown when old password is invalid or user is not found.</exception>
    Task<string> ChangePasswordAsync(int userId, ChangePasswordRequest request);

    /// <summary>
    /// Deactivates a user account asynchronously.
    /// </summary>
    /// <param name="userId">The user ID.</param>
    /// <returns>A success message.</returns>
    /// <exception cref="InvalidOperationException">Thrown when user is not found.</exception>
    Task<string> DeactivateAsync(int userId);

    /// <summary>
    /// Logs out a user by blacklisting their JWT token asynchronously.
    /// </summary>
    /// <param name="userId">The user ID.</param>
    /// <param name="token">The JWT token to blacklist.</param>
    /// <param name="expiresAt">The expiration time of the token (UTC).</param>
    /// <returns>A success message.</returns>
    Task<string> LogoutAsync(int userId, string token, DateTime expiresAt);
}
