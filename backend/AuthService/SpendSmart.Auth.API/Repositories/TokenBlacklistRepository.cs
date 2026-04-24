using Microsoft.EntityFrameworkCore;
using SpendSmart.Auth.API.Data;
using SpendSmart.Auth.API.Models;
using SpendSmart.Auth.API.Repositories.Interfaces;

namespace SpendSmart.Auth.API.Repositories;

/// <summary>
/// Repository implementation for token blacklist operations.
/// </summary>
public class TokenBlacklistRepository : ITokenBlacklistRepository
{
    private readonly AppDbContext _dbContext;

    /// <summary>
    /// Initializes a new instance of the TokenBlacklistRepository class.
    /// </summary>
    /// <param name="dbContext">The application database context.</param>
    public TokenBlacklistRepository(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    /// <summary>
    /// Adds a token to the blacklist asynchronously.
    /// </summary>
    public async Task<TokenBlacklist> AddTokenAsync(TokenBlacklist tokenBlacklist)
    {
        _dbContext.TokenBlacklists.Add(tokenBlacklist);
        await _dbContext.SaveChangesAsync();
        return tokenBlacklist;
    }

    /// <summary>
    /// Checks if a token is blacklisted asynchronously.
    /// </summary>
    public async Task<bool> IsTokenBlacklistedAsync(string token)
    {
        return await _dbContext.TokenBlacklists
            .AnyAsync(tb => tb.Token == token && tb.ExpiresAt > DateTime.UtcNow);
    }

    /// <summary>
    /// Removes expired tokens from the blacklist asynchronously.
    /// Useful for cleaning up old entries and freeing database space.
    /// </summary>
    public async Task<int> RemoveExpiredTokensAsync()
    {
        var expiredTokens = await _dbContext.TokenBlacklists
            .Where(tb => tb.ExpiresAt <= DateTime.UtcNow)
            .ToListAsync();

        _dbContext.TokenBlacklists.RemoveRange(expiredTokens);
        await _dbContext.SaveChangesAsync();

        return expiredTokens.Count;
    }
}
