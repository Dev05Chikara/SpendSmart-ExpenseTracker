namespace SpendSmart.Auth.API.Models;

/// <summary>
/// Represents a blacklisted JWT token.
/// </summary>
public class TokenBlacklist
{
    /// <summary>
    /// Gets or sets the unique identifier for the blacklist entry.
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Gets or sets the JWT token that has been blacklisted.
    /// </summary>
    public string Token { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the timestamp when the token was blacklisted (UTC).
    /// </summary>
    public DateTime BlacklistedAt { get; set; }

    /// <summary>
    /// Gets or sets the timestamp when the token expires (UTC).
    /// Used for cleanup of old blacklist entries.
    /// </summary>
    public DateTime ExpiresAt { get; set; }

    /// <summary>
    /// Gets or sets the user ID associated with the token.
    /// </summary>
    public int UserId { get; set; }
}
