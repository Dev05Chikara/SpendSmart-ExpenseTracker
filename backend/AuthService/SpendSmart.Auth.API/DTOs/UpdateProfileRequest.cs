namespace SpendSmart.Auth.API.DTOs;

/// <summary>
/// Data Transfer Object for updating user profile.
/// </summary>
public class UpdateProfileRequest
{
    /// <summary>
    /// Gets or sets the user's full name.
    /// </summary>
    public string FullName { get; set; } = null!;

    /// <summary>
    /// Gets or sets the user's preferred currency.
    /// </summary>
    public string Currency { get; set; } = null!;
}
