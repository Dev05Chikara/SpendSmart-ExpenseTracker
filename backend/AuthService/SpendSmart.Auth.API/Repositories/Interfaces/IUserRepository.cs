using SpendSmart.Auth.API.Models;

namespace SpendSmart.Auth.API.Repositories.Interfaces;

/// <summary>
/// Repository interface for User entity operations.
/// </summary>
public interface IUserRepository
{
    /// <summary>
    /// Gets a user by email address asynchronously.
    /// </summary>
    /// <param name="email">The email address to search for.</param>
    /// <returns>The user if found; otherwise null.</returns>
    Task<User?> GetUserByEmailAsync(string email);

    /// <summary>
    /// Gets a user by user ID asynchronously.
    /// </summary>
    /// <param name="userId">The user ID to search for.</param>
    /// <returns>The user if found; otherwise null.</returns>
    Task<User?> GetUserByIdAsync(int userId);

    /// <summary>
    /// Creates a new user asynchronously.
    /// </summary>
    /// <param name="user">The user to create.</param>
    /// <returns>The created user with generated ID.</returns>
    Task<User> CreateUserAsync(User user);

    /// <summary>
    /// Updates an existing user asynchronously.
    /// </summary>
    /// <param name="user">The user to update.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task UpdateUserAsync(User user);

    /// <summary>
    /// Gets a user by Google ID asynchronously.
    /// </summary>
    /// <param name="googleId">The Google ID to search for.</param>
    /// <returns>The user if found; otherwise null.</returns>
    Task<User?> GetUserByGoogleIdAsync(string googleId);
}
