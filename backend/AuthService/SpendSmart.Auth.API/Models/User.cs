namespace SpendSmart.Auth.API.Models;

/// <summary>
/// Represents a user in the SpendSmart system.
/// </summary>
public class User
{
    /// <summary>
    /// Gets or sets the unique identifier for the user.
    /// </summary>
    public int UserId { get; set; }

    /// <summary>
    /// Gets or sets the user's full name.
    /// </summary>
    public string FullName { get; set; } = null!;

    /// <summary>
    /// Gets or sets the user's email address (must be unique).
    /// </summary>
    public string Email { get; set; } = null!;

    /// <summary>
    /// Gets or sets the hashed password for the user.
    /// </summary>
    public string PasswordHash { get; set; } = null!;

    /// <summary>
    /// Gets or sets the user's preferred currency (default: INR).
    /// </summary>
    public string Currency { get; set; } = "INR";

    /// <summary>
    /// Gets or sets a value indicating whether the user account is active.
    /// </summary>
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// Gets or sets the date and time when the user account was created (UTC).
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Gets or sets the date and time of the user's last login (UTC, nullable).
    /// </summary>
    public DateTime? LastLoginAt { get; set; }

    /// <summary>
    /// Gets or sets the Google ID for OAuth authentication (nullable).
    /// </summary>
    public string? GoogleId { get; set; }
}
