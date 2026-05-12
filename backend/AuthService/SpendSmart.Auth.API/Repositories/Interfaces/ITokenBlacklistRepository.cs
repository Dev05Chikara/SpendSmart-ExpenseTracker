using SpendSmart.Auth.API.Models;

namespace SpendSmart.Auth.API.Repositories.Interfaces;

/// <summary>
/// Interface for token blacklist repository operations.
/// </summary>
public interface ITokenBlacklistRepository
{
    /// <summary>
    /// Adds a token to the blacklist asynchronously.
    /// </summary>
    /// <param name="tokenBlacklist">The token blacklist entry to add.</param>
    /// <returns>The added token blacklist entry.</returns>
    Task<TokenBlacklist> AddTokenAsync(TokenBlacklist tokenBlacklist);

    /// <summary>
    /// Checks if a token is blacklisted asynchronously.
    /// </summary>
    /// <param name="token">The JWT token to check.</param>
    /// <returns>True if token is blacklisted, false otherwise.</returns>
    Task<bool> IsTokenBlacklistedAsync(string token);

    /// <summary>
    /// Removes expired tokens from the blacklist asynchronously.
    /// </summary>
    /// <returns>The number of tokens removed.</returns>
    Task<int> RemoveExpiredTokensAsync();
}
