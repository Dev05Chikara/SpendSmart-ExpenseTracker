namespace SpendSmart.Auth.API.DTOs;

/// <summary>
/// Data Transfer Object for user information in responses.
/// </summary>
public class UserResponse
{
    /// <summary>
    /// Gets or sets the user's unique identifier.
    /// </summary>
    public int UserId { get; set; }

    /// <summary>
    /// Gets or sets the user's full name.
    /// </summary>
    public string FullName { get; set; } = null!;

    /// <summary>
    /// Gets or sets the user's email address.
    /// </summary>
    public string Email { get; set; } = null!;

    /// <summary>
    /// Gets or sets the user's preferred currency.
    /// </summary>
    public string Currency { get; set; } = null!;

    /// <summary>
    /// Gets or sets a value indicating whether the user account is active.
    /// </summary>
    public bool IsActive { get; set; }

    /// <summary>
    /// Gets or sets the user's role (e.g., User, Admin).
    /// </summary>
    public string Role { get; set; } = "User";

    /// <summary>
    /// Gets or sets the account creation timestamp.
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// Gets or sets the last login timestamp.
    /// </summary>
    public DateTime? LastLoginAt { get; set; }
}
